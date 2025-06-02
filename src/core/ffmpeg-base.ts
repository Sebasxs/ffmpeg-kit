// @dependencies
import { spawn, spawnSync } from 'node:child_process';
import { join, extname, dirname } from 'node:path';
import { accessSync, mkdirSync, constants, existsSync } from 'node:fs';
import crypto from 'crypto';
import mime from 'mime';

// @types
import { FFProbeResult, SimplifiedMetadata } from '../types/ffprobe.js';
import {
   AddFilterParams,
   OutputOptions,
   FFmpegBaseData,
   MediaInput,
   MediaType,
   PrepareInputOptionsParams,
   BuildCommandParams,
   PrepareOutputOptionsParams,
} from '../types/ffmpeg.js';

// @utils
import { getFileMetadata } from '../lib/ffprobe.js';
import {
   FFmpegCommandError,
   FFmpegError,
   FileNotFoundError,
   InvalidFileExtensionError,
   InvalidMimeTypeError,
   InvalidOutputPathError,
} from '../lib/errors.js';

export class FFmpegBase {
   protected _hash: string;
   protected _filterCounter: number = 0;
   protected _outputAudioTag: string | null;
   protected _outputVideoTag: string | null;
   protected _metadata: FFProbeResult;

   protected filterGraphParts: string[];
   protected inputs: Map<string, MediaInput>;
   protected audioSubgraph: string[];
   protected videoSubgraph: string[];

   constructor(path: string) {
      if (!existsSync(path)) {
         throw new FileNotFoundError(path);
      }

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

   protected addInput(path: string, type?: MediaType): string {
      if (!existsSync(path)) {
         throw new FileNotFoundError(path);
      }
      const hash = crypto.createHash('md5').update(path + Date.now().toString()).digest('hex').slice(0, 6);
      const metadata = getFileMetadata(path);
      const mediaType = type || this.getFileType(metadata.summary);
      this.inputs.set(hash, { path, type: mediaType, metadata: metadata.summary });
      return hash;
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

   protected flushAudioSubgraph(): void {
      if (this.audioSubgraph.length) {
         const filter = this.audioSubgraph.join(',');
         this.appendAudioFilterToGraph({ filter });
         this.audioSubgraph = [];
      }
   }

   protected flushVideoSubgraph(): void {
      if (this.videoSubgraph.length) {
         const filter = this.videoSubgraph.join(',');
         this.appendVideoFilterToGraph({ filter });
         this.videoSubgraph = [];
      }
   }

   getCommandData(): FFmpegBaseData {
      this.flushAudioSubgraph();
      this.flushVideoSubgraph();

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

   private prepareCommand(output: string | string[], options: OutputOptions) {
      const outputPath = this.normalizeOutputPath(output);
      const mimeType = this.getMimeType(outputPath);

      const data = this.prepareData(mimeType, options);

      const { inputOptions, filterComplex, audioTag, videoTag } = this.prepareInputOptions({
         overwrite: options.overwrite ?? true,
         mimeType,
         ...data,
      });

      const { outputOptions, mapAudio, mapVideo } = this.prepareOutputOptions({
         inputs: data.inputs,
         audioTag,
         videoTag,
         mimeType,
         options,
      });

      this.ensureDirectoryExists(outputPath);

      const args = this.buildFFmpegArgs({
         output: outputPath,
         inputOptions,
         filterComplex,
         outputOptions,
         mapAudio,
         mapVideo,
      });

      const displayCmd = this.formatCommand('ffmpeg', args);

      return { args, displayCmd };
   }

   run(output: string | string[], options: OutputOptions = {}): string {
      try {
         const { args, displayCmd } = this.prepareCommand(output, options);
         return this.executeFFmpegCommandSync(args, displayCmd);
      } catch (error: any) {
         if (error instanceof FFmpegError) throw error;
         throw new FFmpegError('An unexpected error occurred: ' + error.message);
      }
   }

   async runAsync(output: string | string[], options: OutputOptions = {}): Promise<string> {
      try {
         const { args, displayCmd } = this.prepareCommand(output, options);
         return await this.executeFFmpegCommandAsync(args, displayCmd);
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
      const durationFixed = filterGraphParts.some((part) => part.includes('trim'));
      const videoExpected = mimeType.includes('video') || mimeType.includes('gif');

      if (onlyImages && !durationFixed && videoExpected && !options.duration) {
         options.duration = 5;
      }

      return { inputs, filterGraphParts, outputAudioTag, outputVideoTag };
   }

   private prepareInputOptions(params: PrepareInputOptionsParams) {
      const { inputs, filterGraphParts, mimeType, overwrite, outputAudioTag, outputVideoTag } =
         params;
      const inputOptions: string[] = [];
      if (overwrite) inputOptions.push('-y');
      const staticImageExpected = mimeType.includes('image') && !mimeType.includes('gif');
      let inputIndex = 0;
      let filterComplex = filterGraphParts.join(';');
      let audioTag = outputAudioTag;
      let videoTag = outputVideoTag;

      for (const [key, { path, type }] of inputs) {
         if (type === 'image' && !staticImageExpected) {
            inputOptions.push('-loop', '1');
         }
         inputOptions.push('-i', path);

         const hash = `{${key}}`;

         if (audioTag && audioTag.includes(hash)) {
            audioTag = audioTag.replace(hash, inputIndex.toString());
         }

         if (videoTag && videoTag.includes(hash)) {
            videoTag = videoTag.replace(hash, inputIndex.toString());
         }

         filterComplex = filterComplex.replaceAll(hash, inputIndex.toString());
         inputIndex++;
      }
      return { inputOptions, filterComplex, audioTag, videoTag };
   }

   private prepareOutputOptions(params: PrepareOutputOptionsParams) {
      const { inputs, audioTag, videoTag, mimeType, options } = params;
      let mapAudio = audioTag;
      let mapVideo = videoTag;
      const outputOptions: string[] = [];
      const gifExpected = mimeType.includes('gif');
      const imageExpected = mimeType.includes('image');

      const firstAudioStream = Array.from(inputs.values()).findIndex(
         ({ metadata }) => metadata.hasAudio,
      );

      if (!options.audioNone && firstAudioStream !== -1 && !imageExpected) {
         if (options.audioCodec) outputOptions.push('-c:a', options.audioCodec);
         if (options.audioBitrate) outputOptions.push('-b:a', options.audioBitrate);
         if (options.channels) outputOptions.push('-ac', options.channels.toString());
         if (!audioTag) {
            mapAudio = `${firstAudioStream}:a?`;
            if (!options.audioCodec) outputOptions.push('-c:a', 'copy');
         }
      }

      const firstVideoStream = Array.from(inputs.values()).findIndex(
         ({ metadata }) => metadata.hasVideo,
      );

      if (!options.pixelFormat && (!options.videoCodec || options.videoCodec === 'libx264')) {
         options.pixelFormat = 'yuv420p';
      }

      if (!options.videoNone && firstVideoStream !== -1) {
         if (options.videoCodec) outputOptions.push('-c:v', options.videoCodec);
         if (options.videoBitrate) outputOptions.push('-b:v', options.videoBitrate);
         if (options.fps) outputOptions.push('-r', options.fps.toString());
         if (options.crf) outputOptions.push('-crf', options.crf.toString());
         if (options.preset) outputOptions.push('-preset', options.preset);
         if (options.pixelFormat) outputOptions.push('-pix_fmt', options.pixelFormat);
         if (!videoTag) {
            mapVideo = `${firstVideoStream}:v?`;
            if (!options.videoCodec) outputOptions.push('-c:v', 'copy');
         }
      }

      if (gifExpected) outputOptions.push('-loop', '0');
      if (options.duration) outputOptions.push('-t', options.duration.toString());
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

   private buildFFmpegArgs(params: BuildCommandParams): string[] {
      const { output, inputOptions, outputOptions, filterComplex, mapAudio, mapVideo } = params;

      const args: string[] = ['-hide_banner', '-loglevel', 'error', ...inputOptions];

      if (filterComplex) args.push('-filter_complex', filterComplex);
      if (mapAudio) args.push('-map', mapAudio);
      if (mapVideo) args.push('-map', mapVideo);

      args.push(...outputOptions, output);
      return args;
   }

   private formatCommand(executable: string, args: string[]): string {
      return [
         executable,
         ...args.map((arg) => {
            if (/[\s"']/.test(arg)) {
               return `"${arg.replace(/"/g, '\\"')}"`;
            }
            return arg;
         }),
      ].join(' ');
   }

   private executeFFmpegCommandSync(args: string[], displayCmd: string): string {
      const result = spawnSync('ffmpeg', args, {
         encoding: 'utf-8',
         maxBuffer: 10 * 1024 * 1024,
         windowsHide: true,
      });

      if (result.error) {
         if ((result.error as any).code === 'ENOENT') {
            throw new FFmpegError(
               'FFmpeg binary not found. Please ensure FFmpeg is installed and added to your system PATH.',
            );
         }
         throw new FFmpegError('An unexpected error occurred: ' + result.error.message);
      }

      if (result.status !== 0) {
         const stderr = result.stderr
            ? result.stderr.toString()
            : result.stdout
              ? result.stdout.toString()
              : 'Unknown error';
         throw new FFmpegCommandError(displayCmd, stderr);
      }

      return displayCmd;
   }

   private executeFFmpegCommandAsync(args: string[], displayCmd: string): Promise<string> {
      return new Promise((resolve, reject) => {
         const proc = spawn('ffmpeg', args, { windowsHide: true });
         let stderr = '';

         proc.stderr?.on('data', (chunk) => {
            stderr += chunk.toString();
         });

         proc.on('error', (err) => {
            if ((err as any).code === 'ENOENT') {
               reject(
                  new FFmpegError(
                     'FFmpeg binary not found. Please ensure FFmpeg is installed and added to your system PATH.',
                  ),
               );
            } else {
               reject(new FFmpegError('An unexpected error occurred: ' + err.message));
            }
         });

         proc.on('close', (code) => {
            if (code === 0) {
               resolve(displayCmd);
            } else {
               reject(
                  new FFmpegCommandError(
                     displayCmd,
                     stderr || `FFmpeg process exited with code ${code}`,
                  ),
               );
            }
         });
      });
   }
}
