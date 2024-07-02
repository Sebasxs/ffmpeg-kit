import { FFmpegBase } from '@/core/ffmpeg-base';

// @filters
import {
   CropFilter,
   DynaudnormFilter,
   FadeFilter,
   LoudnormFilter,
   PitchFilter,
   ScaleFilter,
   TrimFilter,
   VolumeFilter,
   SpeedFilter,
   ReverseFilter,
} from '@/filters';

// @types
import {
   CropOptions,
   DynaudnormOptions,
   FadeOptions,
   LoudnormOptions,
   ReverseOptions,
   ScaleOptions,
   TrimOptions,
} from '@/types/filters';

export class MediaEditor extends FFmpegBase {
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

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   fade({ stream, ...options }: FadeOptions): this {
      const { audioFilter, videoFilter } = FadeFilter(options);
      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   crop(options: CropOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Crop filter can only be applied to video streams.');
      }

      const { width, height } = this.getMetadata();
      const { videoFilter } = CropFilter(options, width, height);
      this.addVideoFilter(videoFilter);
      return this;
   }

   scale(options: ScaleOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Scale filter can only be applied to video streams.');
      }

      const { videoFilter } = ScaleFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   reverse(options?: ReverseOptions): this {
      const { audioFilter, videoFilter } = ReverseFilter();
      const { stream } = options || {};

      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   speed(factor: number): this {
      if (factor === 0) {
         throw new Error('Speed factor cannot be zero.');
      }

      if (factor < 0) this.reverse();
      if (Math.abs(factor) === 1) return this;

      const { audioFilter, videoFilter } = SpeedFilter(Math.abs(factor));
      if (this.hasAudioStream()) this.addAudioFilter(audioFilter);
      if (this.hasVideoStream()) this.addVideoFilter(videoFilter);
      return this;
   }
}
