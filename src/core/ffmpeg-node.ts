import { AddFilterParams, MediaInput, MediaType } from '@/types/ffmpeg';
import { join } from 'node:path';
import crypto from 'node:crypto';

export class FfmpegNode {
   private _hash: string;
   private _path: string | null = null;
   private _filterCounter: number = 0;
   private _outputAudioTag: string | null;
   private _outputVideoTag: string | null;

   protected _removeAudio: boolean = false;
   protected _removeVideo: boolean = false;
   protected filterGraphParts: string[];
   protected inputs: Map<string, MediaInput>;

   constructor(filePath?: string | string[], type?: MediaType) {
      this._hash = this.generateHash(filePath);
      this._outputAudioTag = null;
      this._outputVideoTag = null;

      this.inputs = new Map();
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
}
