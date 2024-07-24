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
   BlurFilter,
   FlipFilter,
   DenoiseFilter,
   RotateFilter,
   AlphaFilter,
   PadFilter,
   DelayFilter,
   NegateFilter,
   GrayscaleFilter,
   BrightnessFilter,
   HueFilter,
   ColorBalanceFilter,
   ColorChannelMixerFilter,
   LutFilter,
   ColorMultiplierFilter,
   DeshakeFilter,
   PanFilter,
} from '@/filters';

// @types
import {
   BrightnessOptions,
   ColorBalanceOptions,
   ColorChannelMixerOptions,
   ColorMultiplierOptions,
   ColorPresetValues,
   CropOptions,
   DenoiseOptions,
   DeshakeOptions,
   DynaudnormOptions,
   FadeOptions,
   FlipOptions,
   HueOptions,
   LoudnormOptions,
   PadOptions,
   PanOptions,
   ReverseOptions,
   RotateOptions,
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

   loudnorm(options: LoudnormOptions = { average: -23, range: 9, peak: -1 }): this {
      if (!this.hasAudioStream()) {
         throw new Error('Loudnorm filter can only be applied to audio streams.');
      }

      const { audioFilter } = LoudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   dynaudnorm(options: DynaudnormOptions = { frameLength: 200, peak: 0.9 }): this {
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

      const { summary } = this.getMetadata();
      const sampleRate = summary.audioSampleRate || 44100;
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

      const { summary } = this.getMetadata();
      const { width, height } = summary;
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

   blur(radius: number = 3): this {
      if (!this.hasVideoStream()) {
         throw new Error('Blur filter can only be applied to video streams.');
      }

      const { videoFilter } = BlurFilter(radius);
      this.addVideoFilter(videoFilter);
      return this;
   }

   flip(mode: FlipOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Flip filter can only be applied to video streams.');
      }

      const { videoFilter } = FlipFilter(mode);
      this.addVideoFilter(videoFilter);
      return this;
   }

   denoise(method: DenoiseOptions): this {
      if (method === 'afftdn' && !this.hasAudioStream()) {
         throw new Error('afftdn filter can only be applied to audio streams.');
      }

      if (method !== 'afftdn' && !this.hasVideoStream()) {
         throw new Error('Denoise filter can only be applied to video streams.');
      }

      const { audioFilter, videoFilter } = DenoiseFilter(method);
      if (audioFilter) this.addAudioFilter(audioFilter);
      if (videoFilter) this.addVideoFilter(videoFilter);
      return this;
   }

   rotate(options: RotateOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Rotate filter can only be applied to video streams.');
      }

      const { videoFilter } = RotateFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   alpha(value: number): this {
      if (!this.hasVideoStream()) {
         throw new Error('Alpha filter can only be applied to video streams.');
      }

      if (value < 0 || value > 1) {
         throw new Error('Alpha value must be between 0 and 1.');
      }

      const { videoFilter } = AlphaFilter(value);
      this.addVideoFilter(videoFilter);
      return this;
   }

   pad(options: PadOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Pad filter can only be applied to video streams.');
      }

      const { videoFilter } = PadFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   delay(seconds: number): this {
      const { audioFilter, videoFilter } = DelayFilter(seconds);
      if (this.hasAudioStream()) this.addAudioFilter(audioFilter);
      if (this.hasVideoStream()) this.addVideoFilter(videoFilter);
      return this;
   }

   negate(alpha: boolean = false): this {
      if (!this.hasVideoStream()) {
         throw new Error('Negate filter can only be applied to video streams.');
      }

      const { videoFilter } = NegateFilter(alpha);
      this.addVideoFilter(videoFilter);
      return this;
   }

   grayscale(): this {
      if (!this.hasVideoStream()) {
         throw new Error('Grayscale filter can only be applied to video streams.');
      }

      const { videoFilter } = GrayscaleFilter();
      this.addVideoFilter(videoFilter);
      return this;
   }

   brightness(options: BrightnessOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Brightness filter can only be applied to video streams.');
      }

      const { videoFilter } = BrightnessFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   hue(options: HueOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Hue filter can only be applied to video streams.');
      }

      const { videoFilter } = HueFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorBalance(options: ColorBalanceOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Color balance filter can only be applied to video streams.');
      }

      const { videoFilter } = ColorBalanceFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorMixer(options: ColorChannelMixerOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Color channel mixer filter can only be applied to video streams.');
      }

      const { videoFilter } = ColorChannelMixerFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorPreset(options: ColorPresetValues): this {
      if (!this.hasVideoStream()) {
         throw new Error('Color preset filter can only be applied to video streams.');
      }

      const { videoFilter } = LutFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorMultiplier(options: ColorMultiplierOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Color multiplier filter can only be applied to video streams.');
      }

      const { videoFilter } = ColorMultiplierFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   deshake(options?: DeshakeOptions): this {
      if (!this.hasVideoStream()) {
         throw new Error('Deshake filter can only be applied to video streams.');
      }

      const { videoFilter } = DeshakeFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   pan(options: PanOptions): this {
      if (!this.hasAudioStream()) {
         throw new Error('Pan filter can only be applied to audio streams.');
      }

      const { audioFilter } = PanFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }
}
