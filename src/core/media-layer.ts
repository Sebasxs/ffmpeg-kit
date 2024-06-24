import { FFmpegBase } from '@/core/ffmpeg-base';
import { DynaudnormFilter } from '@/filters/dynaudnorm';
import { FadeFilter } from '@/filters/fade';
import { LoudnormFilter } from '@/filters/loudnorm';
import { PitchFilter } from '@/filters/pitch';
import { TrimFilter } from '@/filters/trim';
import { VolumeFilter } from '@/filters/volume';
import { DynaudnormOptions, FadeOptions, LoudnormOptions, TrimOptions } from '@/types/filters';

export class MediaLayer extends FFmpegBase {
   constructor(filePath: string | string[]) {
      super(filePath);
   }

   volume(value: number | string): this {
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

   pitch(factor: number): this {
      if (!this.hasAudioStream()) {
         throw new Error('Pitch filter can only be applied to audio streams.');
      }

      const sampleRate = this.getMetadata().audioSampleRate || 44100;
      const { audioFilter } = PitchFilter(factor, sampleRate);
      this.addAudioFilter(audioFilter);
      return this;
   }

   trim({ stream, ...options }: TrimOptions): this {
      const { audioFilter, videoFilter } = TrimFilter(options);
      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (hasAudioStream && (!stream || stream !== 'onlyVideo')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'onlyAudio')) this.addVideoFilter(videoFilter);
      return this;
   }

   fade({ stream, ...options }: FadeOptions): this {
      const { audioFilter, videoFilter } = FadeFilter(options);
      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (hasAudioStream && (!stream || stream !== 'onlyVideo')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'onlyAudio')) this.addVideoFilter(videoFilter);
      return this;
   }
}
