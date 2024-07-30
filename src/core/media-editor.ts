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
   DrawTextFilter,
   DrawBoxFilter,
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
   DrawBoxOptions,
   DrawTextOptions,
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

// @utils
import { MissingStreamError } from '@/utils/errors';

export class MediaEditor extends FFmpegBase {
   constructor(filePath: string | string[]) {
      super(filePath);
   }

   volume(value: number | string): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'volume');
      }

      const { audioFilter } = VolumeFilter(value);
      this.addAudioFilter(audioFilter);
      return this;
   }

   loudnorm(options: LoudnormOptions = { average: -23, range: 9, peak: -1 }): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'loudnorm');
      }

      const { audioFilter } = LoudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   dynaudnorm(options: DynaudnormOptions = { frameLength: 200, peak: 0.9 }): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'dynaudnorm');
      }

      const { audioFilter } = DynaudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   pitch(factor: number): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'pitch');
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

      if (!hasAudioStream && !hasVideoStream) {
         throw new MissingStreamError('audio/video', 'trim');
      }

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   fade({ stream, ...options }: FadeOptions): this {
      const { audioFilter, videoFilter } = FadeFilter(options);
      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (!hasAudioStream && !hasVideoStream) {
         throw new MissingStreamError('audio/video', 'fade');
      }

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   crop(options: CropOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'crop');
      }

      const { summary } = this.getMetadata();
      const { width, height } = summary;
      const { videoFilter } = CropFilter(options, width, height);
      this.addVideoFilter(videoFilter);
      return this;
   }

   scale(options: ScaleOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'scale');
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

      if (!hasAudioStream && !hasVideoStream) {
         throw new MissingStreamError('audio/video', 'reverse');
      }

      if (hasAudioStream && (!stream || stream !== 'video')) this.addAudioFilter(audioFilter);
      if (hasVideoStream && (!stream || stream !== 'audio')) this.addVideoFilter(videoFilter);
      return this;
   }

   speed(factor: number): this {
      if (factor < 0) this.reverse();
      if (Math.abs(factor) === 1) return this;

      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (!hasAudioStream && !hasVideoStream) {
         throw new MissingStreamError('audio/video', 'speed');
      }

      const { audioFilter, videoFilter } = SpeedFilter(Math.abs(factor));
      if (hasAudioStream) this.addAudioFilter(audioFilter);
      if (hasVideoStream) this.addVideoFilter(videoFilter);
      return this;
   }

   blur(radius: number = 3): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'blur');
      }

      const { videoFilter } = BlurFilter(radius);
      this.addVideoFilter(videoFilter);
      return this;
   }

   flip(mode: FlipOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'flip');
      }

      const { videoFilter } = FlipFilter(mode);
      this.addVideoFilter(videoFilter);
      return this;
   }

   denoise(method: DenoiseOptions): this {
      if (method === 'afftdn' && !this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'denoise[afftdn]');
      }

      if (method !== 'afftdn' && !this.hasVideoStream()) {
         throw new MissingStreamError('video', 'denoise[!afftdn]');
      }

      const { audioFilter, videoFilter } = DenoiseFilter(method);
      if (audioFilter) this.addAudioFilter(audioFilter);
      if (videoFilter) this.addVideoFilter(videoFilter);
      return this;
   }

   rotate(options: RotateOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'rotate');
      }

      const { videoFilter } = RotateFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   alpha(value: number): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'alpha');
      }

      const { videoFilter } = AlphaFilter(value);
      this.addVideoFilter(videoFilter);
      return this;
   }

   pad(options: PadOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'pad');
      }

      const { videoFilter } = PadFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   delay(seconds: number): this {
      const { audioFilter, videoFilter } = DelayFilter(seconds);

      const hasAudioStream = this.hasAudioStream();
      const hasVideoStream = this.hasVideoStream();

      if (!hasAudioStream && !hasVideoStream) {
         throw new MissingStreamError('audio/video', 'delay');
      }

      if (hasAudioStream) this.addAudioFilter(audioFilter);
      if (hasVideoStream) this.addVideoFilter(videoFilter);
      return this;
   }

   negate(alpha: boolean = false): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'negate');
      }

      const { videoFilter } = NegateFilter(alpha);
      this.addVideoFilter(videoFilter);
      return this;
   }

   grayscale(): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'grayscale');
      }

      const { videoFilter } = GrayscaleFilter();
      this.addVideoFilter(videoFilter);
      return this;
   }

   brightness(options: BrightnessOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'brightness');
      }

      const { videoFilter } = BrightnessFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   hue(options: HueOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'hue');
      }

      const { videoFilter } = HueFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorBalance(options: ColorBalanceOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorbalance');
      }

      const { videoFilter } = ColorBalanceFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorMixer(options: ColorChannelMixerOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorchannelmixer');
      }

      const { videoFilter } = ColorChannelMixerFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorPreset(options: ColorPresetValues): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorpreset[lutrgb]');
      }

      const { videoFilter } = LutFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   colorMultiplier(options: ColorMultiplierOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colormultiplier[lutrgb]');
      }

      const { videoFilter } = ColorMultiplierFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   deshake(options?: DeshakeOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'deshake');
      }

      const { videoFilter } = DeshakeFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   pan(options: PanOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'pan');
      }

      const { audioFilter } = PanFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   drawText(options: DrawTextOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'drawtext');
      }

      const { videoFilter } = DrawTextFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   drawBox(options: DrawBoxOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'drawbox');
      }

      const { videoFilter } = DrawBoxFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }
}
