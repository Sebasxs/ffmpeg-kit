import { FFmpegBase } from '@/core/ffmpeg-base';
import { DynaudnormFilter } from '@/filters/dynaudnorm';
import { LoudnormFilter } from '@/filters/loudnorm';
import { PitchFilter } from '@/filters/pitch';
import { VolumeFilter } from '@/filters/volume';
import { DynaudnormOptions, LoudnormOptions, PitchOptions } from '@/types/filters';

export class MediaLayer extends FFmpegBase {
   constructor(filePath: string | string[]) {
      super(filePath);
   }

   volume(value: number): this {
      if (!this.hasAudioStream()) {
         throw new Error('Volume filter can only be applied to audio streams.');
      }

      const { audioFilter } = VolumeFilter(value);
      this.addAudioFilter(audioFilter);
      return this;
   }

   loudnorm(options: LoudnormOptions = { I: -23, LRA: 9, TP: -1 }): this {
      if (!this.hasAudioStream()) {
         throw new Error('Loudnorm filter can only be applied to audio streams.');
      }

      const { audioFilter } = LoudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   dynaudnorm(options: DynaudnormOptions = { f: 1, m: true }): this {
      if (!this.hasAudioStream()) {
         throw new Error('Dynaudnorm filter can only be applied to audio streams.');
      }

      const { audioFilter } = DynaudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   pitch(options: PitchOptions): this {
      if (!this.hasAudioStream()) {
         throw new Error('Pitch filter can only be applied to audio streams.');
      }

      const { audioFilter } = PitchFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }
}
