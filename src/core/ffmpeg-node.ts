import { AddFilterParams, FFmpegNodeData, MediaInput, MediaType } from '@/types/ffmpeg';
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import crypto from 'node:crypto';

export class FFmpegNode {
   private _hash: string;
   private _path: string | null = null;
   private _filterCounter: number = 0;
   private _outputAudioTag: string | null;
   private _outputVideoTag: string | null;

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
         inputs: this.inputs,
         filterGraphParts: this.filterGraphParts,
         outputAudioTag: this._removeAudio ? null : this._outputAudioTag,
         outputVideoTag: this._removeVideo ? null : this._outputVideoTag,
      };
   }

   private async buildGraph(): Promise<void> {
      if (this._removeAudio && this._removeVideo) {
         throw new Error('Cannot remove both audio and video');
      }

      for (const key of this.inputs.keys()) {
         const value = this.inputs.get(key);
         if (!value) continue;

         const { path, type } = value;
         const metadata = this.getFileMetadata(path);
         this.inputsMetadata.set(key, metadata);
      }
      // const firstAudioIndex = this.resolvedSources.findIndex((input) => input.hasAudio);
      // if (this.expectAudio && firstAudioIndex !== -1) {
      //    if (!this._outputAudioTag) {
      //       this._outputAudioTag = this.addAudioFilter({
      //          inputs: [`[${firstAudioIndex}:a]`],
      //          filter: 'anull',
      //       });
      //    }
      //    this._command.addOptions(['-map', this._outputAudioTag]);
      // }
      // const firstVideoIndex = this.resolvedSources.findIndex(
      //    ({ hasVideo, type }) => hasVideo || type === 'image',
      // );
      // if (this.expectVideo && firstVideoIndex !== -1) {
      //    if (!this._outputVideoTag) {
      //       this._outputVideoTag = this.addVideoFilter({
      //          inputs: [`[${firstVideoIndex}:v]`],
      //          filter: 'null',
      //       });
      //    }
      //    this._command.addOptions(['-map', this._outputVideoTag]);
      // }
      // this._command.complexFilter(this.filterGraphParts);
   }

   async run(): Promise<void> {
      // si solo hay una imagen se retonar la misma imagen
      // si solo hay una imagen pero se pide exportar video, asignar una duracion si no se asigna
   }
}
