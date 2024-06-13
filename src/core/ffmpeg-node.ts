// @dependencies
import { execSync } from 'node:child_process';
import { join, extname } from 'node:path';
import crypto from 'crypto';
import mime from 'mime';

// @types
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';
import {
   AddFilterParams,
   OutputOptions,
   FFmpegNodeData,
   MediaInput,
   MediaType,
   PrepareInputOptionsParams,
   BuildCommandParams,
   PrepareOutputOptionsParams,
} from '@/types/ffmpeg';

export class FFmpegNode {
   private _hash: string;
   private _path: string | null = null;
   private _filterCounter: number = 0;
   private _outputAudioTag: string | null;
   private _outputVideoTag: string | null;
   private _metadata: SimplifiedMetadata;

   protected filterGraphParts: string[];
   protected inputs: Map<string, MediaInput>;
   protected audioSubgraph: string[];
   protected videoSubgraph: string[];

   constructor(filePath: string | string[], type: MediaType) {
      this._hash = this.generateHash(filePath);
      this._outputAudioTag = null;
      this._outputVideoTag = null;

      this.inputs = new Map();
      this.filterGraphParts = [];
      this.audioSubgraph = [];
      this.videoSubgraph = [];

      const normalizedPath = Array.isArray(filePath) ? join(...filePath) : filePath;
      this._path = normalizedPath;
      this._metadata = this.getFileMetadata(normalizedPath);
      this.inputs.set(this._hash, { path: normalizedPath, type });
   }

   protected getPath(): string | null {
      return this._path;
   }

   private generateHash(filePath: string | string[]): string {
      const path = Array.isArray(filePath) ? join(...filePath) : filePath;
      return crypto.createHash('md5').update(path).digest('hex').slice(0, 6);
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

   protected addAudioFilterPart({ filter, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputAudioTag || `[{${this._hash}}:a]`];
      const generatedOutputTag = outputTag || this.generateFilterTag('audio');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputAudioTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   protected addVideoFilterPart({ filter, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputVideoTag || `[{${this._hash}}:v]`];
      const generatedOutputTag = outputTag || this.generateFilterTag('video');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputVideoTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   getData(): FFmpegNodeData {
      if (this.audioSubgraph.length) {
         const filter = this.audioSubgraph.join(',');
         this.addAudioFilterPart({ filter });
         this.audioSubgraph = [];
      }

      if (this.videoSubgraph.length) {
         const filter = this.videoSubgraph.join(',');
         this.addVideoFilterPart({ filter });
         this.videoSubgraph = [];
      }

      return {
         hash: this._hash,
         inputs: this.inputs,
         filterGraphParts: this.filterGraphParts,
         outputAudioTag: this._outputAudioTag,
         outputVideoTag: this._outputVideoTag,
      };
   }

   getMetadata(full?: boolean): SimplifiedMetadata | FFProbeResult {
      if (full && this._path) return this.getFileMetadata(this._path, true);
      return this._metadata;
   }

   protected getFileMetadata(path: string, full: true): FFProbeResult;
   protected getFileMetadata(path: string, full?: false): SimplifiedMetadata;
   protected getFileMetadata(path: string, full?: boolean): FFProbeResult | SimplifiedMetadata {
      const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${path}"`;
      try {
         const result = execSync(cmd, { encoding: 'utf-8' });
         const { streams, format } = JSON.parse(result) as FFProbeResult;
         if (full) return { streams, format };

         const videoStream = streams.find((source) => source.codec_type === 'video');
         const audioStream = streams.find((source) => source.codec_type === 'audio');

         const getFrameRate = (frameRate: string | undefined) => {
            if (!frameRate) return undefined;
            const [numerator, denominator] = frameRate.split('/');
            return Number(numerator) / Number(denominator);
         };

         const parseProperty = (property: string | undefined) => {
            if (!property) return undefined;
            return parseInt(property, 10);
         };

         return {
            hasAudio: !!audioStream,
            hasVideo: !!videoStream,
            duration: parseProperty(format.duration),
            size: parseProperty(format.size),
            bitRate: parseProperty(format.bit_rate),
            height: videoStream?.height,
            width: videoStream?.width,
            aspectRatio: videoStream?.display_aspect_ratio,
            frameRate: getFrameRate(videoStream?.r_frame_rate),
            audioChannels: audioStream?.channels,
            audioSampleRate: parseProperty(audioStream?.sample_rate),
            formatName: format.format_name,
            tags: format.tags || {},
         };
      } catch (error: any) {
         throw new Error(`Failed to get media info: ${error.message}`);
      }
   }

   run(output: string | string[], options: OutputOptions = {}): string {
      const outputPath = this.normalizeOutputPath(output);
      const mimeType = this.validateOutputAndGetMimeType(outputPath);

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
   }

   private normalizeOutputPath(output: string | string[]): string {
      const outputPath = Array.isArray(output) ? join(...output) : output;
      if (!outputPath || outputPath === '.') throw new Error('Output path is required');
      return outputPath;
   }

   private validateOutputAndGetMimeType(outputPath: string): string {
      const ext = extname(outputPath).slice(1);
      if (!ext) throw new Error('Output filename and extension is required');
      const mimeType = mime.getType(ext);
      if (!mimeType) throw new Error('Invalid output file extension');
      return mimeType;
   }

   private prepareData(mimeType: string, options: OutputOptions): Omit<FFmpegNodeData, 'hash'> {
      const { inputs, filterGraphParts, outputAudioTag, outputVideoTag } = this.getData();
      const onlyImages = Array.from(inputs.values()).every((input) => input.type === 'image');
      const someTrimmed = filterGraphParts.some((part) => part.includes('trim'));
      const videoExpected = mimeType.includes('video');

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
         ({ type }) => type === 'audio' || (type === 'video' && this._metadata.hasAudio),
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
         ({ type }) => type === 'video' || type === 'image',
      );

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

   private buildFFmpegCommand(params: BuildCommandParams): string {
      const { output, inputOptions, outputOptions, filterGraphParts, mapAudio, mapVideo } = params;

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
         console.error('FFmpeg command failed:', error);
         if (error.stderr) console.error('FFmpeg stderr:', error.stderr);
         throw new Error(`Failed to run ffmpeg: ${error.message}.`);
      }
   }
}
