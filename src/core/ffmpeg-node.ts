// @dependencies
import { execSync } from 'node:child_process';
import { join, extname } from 'node:path';
import crypto from 'node:crypto';
import mime from 'mime';

// @types
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';
import {
   AddFilterParams,
   OutputOptions,
   FFmpegNodeData,
   MediaInput,
   MediaType,
} from '@/types/ffmpeg';

export class FFmpegNode {
   private _hash: string;
   private _path: string | null = null;
   private _filterCounter: number = 0;
   private _outputAudioTag: string | null;
   private _outputVideoTag: string | null;
   private _options: OutputOptions = {};

   protected _removeAudio: boolean = false;
   protected _removeVideo: boolean = false;
   protected filterGraphParts: string[];
   protected inputs: Map<string, MediaInput>;
   protected inputsMetadata: Map<string, SimplifiedMetadata>;

   constructor(filePath?: string | string[], type?: MediaType) {
      this._hash = this.generateHash(filePath);
      this._outputAudioTag = null;
      this._outputVideoTag = null;

      this.inputs = new Map();
      this.inputsMetadata = new Map();
      this.filterGraphParts = [];

      if (filePath && type) {
         const normalizedPath = Array.isArray(filePath) ? join(...filePath) : filePath;
         this._path = normalizedPath;
         this.inputs.set(this._hash, { path: normalizedPath, type });
      }
   }

   protected getPath(): string | null {
      return this._path;
   }

   private generateHash(filePath?: string | string[]): string {
      if (!filePath) return crypto.randomBytes(3).toString('hex');

      const path = Array.isArray(filePath) ? join(...filePath) : filePath;
      return crypto.createHash('md5').update(path).digest('hex').slice(0, 6);
   }

   private generateFilterTag(filterRef: string, inputType: 'video' | 'audio'): string {
      const nodeId = `{${this._hash}}_${filterRef}_${this._filterCounter++}`;
      const streamChannel = inputType.charAt(0);
      return `[${nodeId}:${streamChannel}]`;
   }

   protected addAudioFilter({ filter, ref, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputAudioTag || `[{${this._hash}}:a]`];
      const generatedOutputTag = outputTag || this.generateFilterTag(ref, 'audio');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputAudioTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   protected addVideoFilter({ filter, ref, inputs, outputTag }: AddFilterParams): string {
      const inputTags = inputs || [this._outputVideoTag || `[{${this._hash}}:v]`];
      const generatedOutputTag = outputTag || this.generateFilterTag(ref, 'video');
      const filterString = `${inputTags.join('')}${filter}${generatedOutputTag}`;
      this._outputVideoTag = generatedOutputTag;
      this.filterGraphParts.push(filterString);
      return generatedOutputTag;
   }

   protected getFileMetadata(path: string, full: true): FFProbeResult;

   protected getFileMetadata(path: string, full?: false): SimplifiedMetadata;

   protected getFileMetadata(path: string, full?: boolean): FFProbeResult | SimplifiedMetadata {
      try {
         const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${path}"`;
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

   getData(): FFmpegNodeData {
      return {
         hash: this._hash,
         inputs: this.inputs,
         filterGraphParts: this.filterGraphParts,
         outputAudioTag: this._removeAudio ? null : this._outputAudioTag,
         outputVideoTag: this._removeVideo ? null : this._outputVideoTag,
      };
   }

   async run(output: string | string[], options?: OutputOptions): Promise<string> {
      if (Array.isArray(output)) output = join(...output);
      if (!output || output === '.') throw new Error('Output path is required');
      const ext = extname(output).slice(1);
      if (!ext) throw new Error('Output filename and extension is required');
      if (options) this._options = { ...this._options, ...options };
      const mimeType = mime.getType(ext);
      if (!mimeType) throw new Error('Invalid output file extension');

      const onlyImages = Array.from(this.inputs.values()).every((input) => input.type === 'image');
      const someTrimmed = this.filterGraphParts.some((part) => part.includes('trim'));
      const gifExpected = mimeType.includes('gif');
      const imageExpected = mimeType.includes('image') || !gifExpected;
      const videoExpected = mimeType.includes('video');
      if (onlyImages && !someTrimmed && videoExpected && !this._options.duration) {
         this._options.duration = 5;
      }

      const {
         audioCodec,
         videoCodec,
         audioBitrate = '96k',
         videoBitrate = '1M',
         channels,
         fps,
         crf,
         preset,
         duration,
         shortest = true,
         pixelFormat,
         overwrite = true,
      } = this._options;

      let inputIndex = 0;
      const inputOptions = [];
      if (overwrite) inputOptions.push('-y');

      for (const [key, { path, type }] of this.inputs) {
         if (type === 'image' && !imageExpected) {
            inputOptions.push(`-loop 1`);
         }

         inputOptions.push(`-i ${path}`);

         this.filterGraphParts = this.filterGraphParts.map((part) => {
            const hash = `{${key}}`;
            return part.includes(hash) ? part.replace(hash, inputIndex.toString()) : part;
         });

         inputIndex++;
      }

      const filterGraph = '-filter_complex "' + this.filterGraphParts.join(';') + '"';

      const outputOptions = [];
      if (audioCodec) outputOptions.push(`-c:a ${audioCodec}`);
      if (videoCodec) outputOptions.push(`-c:v ${videoCodec}`);
      if (duration) outputOptions.push(`-t ${duration}`);
      if (audioBitrate) outputOptions.push(`-b:a ${audioBitrate}`);
      if (videoBitrate) outputOptions.push(`-b:v ${videoBitrate}`);
      if (channels) outputOptions.push(`-ac ${channels}`);
      if (fps) outputOptions.push(`-r ${fps}`);
      if (shortest) outputOptions.push('-shortest');
      if (crf) outputOptions.push(`-crf ${crf}`);
      if (preset) outputOptions.push(`-preset ${preset}`);
      if (pixelFormat) outputOptions.push(`-pix_fmt ${pixelFormat}`);

      const cmd = `ffmpeg ${inputOptions.join(' ')} ${filterGraph} -map "${this._outputVideoTag}" -map "${this._outputAudioTag}" ${outputOptions.join(' ')} ${output}`;

      try {
         execSync(cmd, { encoding: 'utf-8' });
         return cmd;
      } catch (error: any) {
         throw new Error(`Failed to run ffmpeg: ${error.message}`);
      }
   }
}
