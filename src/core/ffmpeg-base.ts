// @dependencies
import { execSync } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { accessSync, mkdirSync, constants } from 'node:fs';
import crypto from 'crypto';
import mime from 'mime';

// @types
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';
import {
   AddFilterParams,
   OutputOptions,
   FFmpegBaseData,
   MediaInput,
   MediaType,
   PrepareInputOptionsParams,
   BuildCommandParams,
   PrepareOutputOptionsParams,
} from '@/types/ffmpeg';

// @utils
import { getFileMetadata } from '@/lib/ffprobe';
import {
   FFmpegCommandError,
   FFmpegError,
   InvalidFileExtensionError,
   InvalidMimeTypeError,
   InvalidOutputPathError,
} from '@/lib/errors';

export class FFmpegBase {
   private _hash: string;
   private _filterCounter: number = 0;
   private _outputAudioTag: string | null;
   private _outputVideoTag: string | null;
   private _metadata: FFProbeResult;

   protected filterGraphParts: string[];
   protected inputs: Map<string, MediaInput>;
   protected audioSubgraph: string[];
   protected videoSubgraph: string[];

   constructor(path: string) {
      this._hash = crypto.createHash('md5').update(path).digest('hex').slice(0, 6);
      this._outputAudioTag = null;
      this._outputVideoTag = null;

      this.inputs = new Map();
      this.filterGraphParts = [];
      this.audioSubgraph = [];
      this.videoSubgraph = [];

      const metadata = getFileMetadata(path);
      this._metadata = metadata;
      const type = this.getFileType(metadata.summary);
      this.inputs.set(this._hash, { path, type, metadata: metadata.summary });
   }

   protected hasAudioStream(): boolean {
      return this.getMetadata().summary.hasAudio || this._outputAudioTag !== null;
   }

   protected hasVideoStream(): boolean {
      return this.getMetadata().summary.hasVideo || this._outputVideoTag !== null;
   }

   private getFileType(metadata: SimplifiedMetadata): MediaType {
      const { hasAudio, hasVideo, frameCount, duration } = metadata;
      if (hasAudio && !hasVideo) return 'audio';
      if (!hasVideo) throw new Error('No video or audio stream found');
      if (!frameCount || frameCount === 0 || !duration) return 'image';
      return 'video';
   }

   protected addAudioFilter(filter: string): void {
      this.audioSubgraph.push(filter);
   }

   protected addVideoFilter(filter: string): void {
      this.videoSubgraph.push(filter);
   }

   private generateFilterTag(inputType: 'video' | 'audio'): string {
      const nodeId = `{${this._hash}}_${this._filterCounter++}`;
      const streamChannel = inputType.charAt(0);
      return `[${nodeId}:${streamChannel}]`;
   }

   protected appendAudioFilterToGraph({ filter, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputAudioTag || `[{${this._hash}}:a]`];
      const generatedOutputTag = outputTag || this.generateFilterTag('audio');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputAudioTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   protected appendVideoFilterToGraph({ filter, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputVideoTag || `[{${this._hash}}:v]`];
      const generatedOutputTag = outputTag || this.generateFilterTag('video');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputVideoTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   getCommandData(): FFmpegBaseData {
      if (this.audioSubgraph.length) {
         const filter = this.audioSubgraph.join(',');
         this.appendAudioFilterToGraph({ filter });
         this.audioSubgraph = [];
      }

      if (this.videoSubgraph.length) {
         const filter = this.videoSubgraph.join(',');
         this.appendVideoFilterToGraph({ filter });
         this.videoSubgraph = [];
      }

      return {
         inputs: this.inputs,
         filterGraphParts: this.filterGraphParts,
         outputAudioTag: this._outputAudioTag,
         outputVideoTag: this._outputVideoTag,
      };
   }

   getMetadata(): FFProbeResult {
      return this._metadata;
   }

   run(output: string | string[], options: OutputOptions = {}): string {
      try {
         const outputPath = this.normalizeOutputPath(output);
         const mimeType = this.getMimeType(outputPath);

         const { inputs, filterGraphParts, outputAudioTag, outputVideoTag } = this.prepareData(
            mimeType,
            options,
         );

         const inputOptions = this.prepareInputOptions({
            overwrite: options.overwrite ?? true,
            inputs,
            filterGraphParts,
            mimeType,
         });

         const { outputOptions, mapAudio, mapVideo } = this.prepareOutputOptions({
            inputs,
            outputAudioTag,
            outputVideoTag,
            mimeType,
            options,
         });

         const ffmpegCommand = this.buildFFmpegCommand({
            output: outputPath,
            inputOptions,
            filterGraphParts,
            outputOptions,
            mapAudio,
            mapVideo,
         });

         return this.executeFFmpegCommand(ffmpegCommand);
      } catch (error: any) {
         if (error instanceof FFmpegError) throw error;
         throw new FFmpegError('An unexpected error occurred: ' + error.message);
      }
   }

   private normalizeOutputPath(output: string | string[]): string {
      const outputPath = Array.isArray(output) ? join(...output) : output;
      if (!outputPath || outputPath === '.') {
         throw new InvalidOutputPathError('Output path is required');
      }
      return outputPath;
   }

   private getMimeType(outputPath: string): string {
      const ext = extname(outputPath).slice(1);
      if (!ext) throw new InvalidFileExtensionError(ext);
      const mimeType = mime.getType(ext);
      if (!mimeType) throw new InvalidMimeTypeError(ext);
      return mimeType;
   }

   private prepareData(mimeType: string, options: OutputOptions): Omit<FFmpegBaseData, 'hash'> {
      const { inputs, filterGraphParts, outputAudioTag, outputVideoTag } = this.getCommandData();
      const onlyImages = Array.from(inputs.values()).every((input) => input.type === 'image');
      const someTrimmed = filterGraphParts.some((part) => part.includes('trim'));
      const videoExpected = mimeType.includes('video') || mimeType.includes('gif');

      if (onlyImages && !someTrimmed && videoExpected && !options.duration) {
         options.duration = 5;
      }

      return { inputs, filterGraphParts, outputAudioTag, outputVideoTag };
   }

   private prepareInputOptions(params: PrepareInputOptionsParams): string[] {
      const { inputs, filterGraphParts, mimeType, overwrite } = params;
      const inputOptions: string[] = [];
      if (overwrite) inputOptions.push('-y');
      const staticImageExpected = mimeType.includes('image') && !mimeType.includes('gif');
      let inputIndex = 0;
      let updatedFilterGraphParts = [...filterGraphParts];

      for (const [key, { path, type }] of inputs) {
         if (type === 'image' && !staticImageExpected) {
            inputOptions.push(`-loop 1`);
         }

         inputOptions.push(`-i ${path}`);
         updatedFilterGraphParts = updatedFilterGraphParts.map((part) => {
            const hash = `{${key}}`;
            return part.includes(hash) ? part.replaceAll(hash, inputIndex.toString()) : part;
         });
         inputIndex++;
      }
      return inputOptions;
   }

   private prepareOutputOptions(params: PrepareOutputOptionsParams) {
      const { inputs, outputAudioTag, outputVideoTag, mimeType, options } = params;
      let mapAudio = outputAudioTag;
      let mapVideo = outputVideoTag;
      const outputOptions: string[] = [];
      const gifExpected = mimeType.includes('gif');
      const imageExpected = mimeType.includes('image');

      const firstAudioStream = Array.from(inputs.values()).findIndex(
         ({ metadata }) => metadata.hasAudio,
      );

      if (!options.audioNone && firstAudioStream !== -1 && !imageExpected) {
         if (options.audioCodec) outputOptions.push(`-c:a ${options.audioCodec}`);
         if (options.audioBitrate ?? '96k') outputOptions.push(`-b:a ${options.audioBitrate}`);
         if (options.channels) outputOptions.push(`-ac ${options.channels}`);
         if (!outputAudioTag) {
            mapAudio = `${firstAudioStream}:a?`;
            if (!options.audioCodec) outputOptions.push('-c:a copy');
         }
      }

      const firstVideoStream = Array.from(inputs.values()).findIndex(
         ({ metadata }) => metadata.hasVideo,
      );

      if (!options.pixelFormat && (!options.videoCodec || options.videoCodec === 'libx264')) {
         options.pixelFormat = 'yuv420p';
      }

      if (!options.videoNone && firstVideoStream !== -1) {
         if (options.videoCodec) outputOptions.push(`-c:v ${options.videoCodec}`);
         if (options.videoBitrate ?? '1M') outputOptions.push(`-b:v ${options.videoBitrate}`);
         if (options.fps) outputOptions.push(`-r ${options.fps}`);
         if (options.crf) outputOptions.push(`-crf ${options.crf}`);
         if (options.preset) outputOptions.push(`-preset ${options.preset}`);
         if (options.pixelFormat) outputOptions.push(`-pix_fmt ${options.pixelFormat}`);
         if (!outputVideoTag) {
            mapVideo = `${firstVideoStream}:v?`;
            if (!options.videoCodec) outputOptions.push('-c:v copy');
         }
      }

      if (gifExpected) outputOptions.push('-loop 0');
      if (options.duration) outputOptions.push(`-t ${options.duration}`);
      if (options.shortest ?? true) outputOptions.push('-shortest');

      return { outputOptions, mapAudio, mapVideo };
   }

   private ensureDirectoryExists(outputPath: string): void {
      const dirPath = dirname(outputPath);
      try {
         accessSync(dirPath, constants.F_OK);
      } catch (error) {
         mkdirSync(dirPath, { recursive: true });
      }
   }

   private buildFFmpegCommand(params: BuildCommandParams): string {
      const { output, inputOptions, outputOptions, filterGraphParts, mapAudio, mapVideo } = params;
      this.ensureDirectoryExists(output);

      let cmd = `ffmpeg ${inputOptions.join(' ')}`;

      if (filterGraphParts.length) cmd += ` -filter_complex "${filterGraphParts.join(';')}"`;
      if (mapAudio) cmd += ` -map ${mapAudio}`;
      if (mapVideo) cmd += ` -map ${mapVideo}`;

      cmd += ` ${outputOptions.join(' ')} ${output}`;
      return cmd;
   }

   private executeFFmpegCommand(command: string): string {
      try {
         execSync(command, { encoding: 'utf-8' });
         return command;
      } catch (error: any) {
         if (error.stderr) throw new FFmpegCommandError(command, error.stderr);
         throw new FFmpegError('An unexpected error occurred: ' + error.message);
      }
   }
}
