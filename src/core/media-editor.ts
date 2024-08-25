import { FFmpegBase } from '@/core/ffmpeg-base';
import { z, prettifyError } from 'zod';

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
   VolumeOptions,
} from '@/types/filters';

// @utils
import { MissingStreamError, NoParametersError } from '@/lib/errors';
import { LoudnormSchema, VolumeSchema, DynaudnormSchema, PitchSchema } from '@/lib/validations';
/**
 * MediaEditor class provides a fluent interface for applying various audio and video filters to media files using FFmpeg.
 * It extends FFmpegBase, which handles the underlying FFmpeg command execution.
 */
export class MediaEditor extends FFmpegBase {
   /**
    * Creates a new MediaEditor instance.
    * @param path - The path to the input media file.
    */
   constructor(path: string) {
      super(path);
   }

   /**
    * Adjusts the volume of the audio stream.
    *
    * @param options - Options object with the following keys:
    *   - **volume**: Volume level or expression to apply.
    *   - **_eval**: Evaluation mode (`once` or `frame`) to control how often the volume is recalculated.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#volume FFmpeg volume filter documentation}
    */
   volume(options: VolumeOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'volume');
      }

      const result = VolumeSchema.safeParse(options);
      if (!result.success) {
         const pretty = prettifyError(result.error);
         throw new Error(pretty);
      }

      const { audioFilter } = VolumeFilter(result.data);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Enables EBU R128 loudness normalization.
    *
    * Targets integrated loudness (IL), loudness range (LRA), and true peak (TP).
    *
    * @param options - Options object with the following keys:
    *   - **average**: Integrated loudness target in LUFS (e.g. -23.0).
    *   - **range**: Target loudness range (LRA) in LU.
    *   - **peak**: Maximum allowed true peak level in dBTP.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#loudnorm FFmpeg loudnorm filter documentation}
    */
   loudnorm(options: LoudnormOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'loudnorm');
      }

      const result = LoudnormSchema.safeParse(options);
      if (!result.success) {
         const pretty = prettifyError(result.error);
         throw new Error(pretty);
      }

      const { audioFilter } = LoudnormFilter(result.data);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Applies dynamic volume normalization to audio by adjusting gain in real-time.
    * Unlike basic normalization, this filter continuously adapts the gain to the input
    * signal, amplifying quieter parts while preserving loud parts from clipping.
    * The result is a more balanced output volume across the entire audio stream,
    * without compressing the dynamic range within individual sections.
    * This ensures the natural dynamics of the audio are maintained.
    *
    * @param options - Options object with the following keys:
    *   - **frameLength**: Frame duration in milliseconds.
    *   - **gaussSize**: Gaussian smoothing window size (must be odd).
    *   - **peak**: Target peak level (0.0–1.0).
    *   - **maxGain**: Maximum gain factor per frame.
    *   - **rms**: Target RMS loudness level.
    *   - **compress**: Compression factor before normalization.
    *   - **threshold**: Minimum input magnitude to normalize.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#dynaudnorm FFmpeg dynaudnorm filter documentation}
    */
   dynaudnorm(options: DynaudnormOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'dynaudnorm');
      }

      const result = DynaudnormSchema.safeParse(options);
      if (!result.success) {
         const pretty = prettifyError(result.error);
         throw new Error(pretty);
      }

      const { audioFilter } = DynaudnormFilter(result.data);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Changes the pitch of the audio without altering its duration.
    * Increases or decreases the sampling rate by a given factor, then resamples to the original rate
    * and compensates playback speed to maintain original timing.
    *
    * @param factor Pitch shift multiplier. Values >1 increase pitch, <1 decrease it.
    * @range 0.125 to 8.0
    *
    * @example
    * pitch(1.2) // raises pitch by 20%
    * pitch(0.8) // lowers pitch by 20%
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#asetrate FFmpeg asetrate filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#aresample FFmpeg aresample filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#atempo FFmpeg atempo filter documentation}
    */
   pitch(factor: number): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'pitch');
      }

      const result = PitchSchema.safeParse(factor);
      if (!result.success) {
         const pretty = prettifyError(result.error);
         throw new Error(pretty);
      }

      const { summary } = this.getMetadata();
      const sampleRate = summary.audioSampleRate || 44100;
      const { audioFilter } = PitchFilter(result.data, sampleRate);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Trims the input to output a single continuous segment.
    * Useful for extracting a specific portion of the media based on start and/or end time (or duration).
    *
    * @param options - Options object with the following keys:
    *   - **stream**: Which stream to trim ('audio' | 'video').
    *   - **start**: Timestamp to begin output (e.g. `'00:00:30'` or `12`).
    *   - **end**: Timestamp to stop output (optional).
    *   - **duration**: Max segment duration starting from `start` (optional).
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#trim FFmpeg trim filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#atrim FFmpeg atrim filter documentation}
    */
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

   /**
    * Applies a fade-in or fade-out effect to the input video or audio stream.
    *
    * @param options - Options object with the following keys:
    *   - **type**: `'in' | 'out'` — Whether to fade in or out.
    *   - **duration**: How long the fade effect lasts (in seconds).
    *   - **start**: When the fade should start (in seconds, optional).
    *   - **curve**: (Audio) Fade curve shape (e.g., 'linear', 'quadratic').
    *   - **color**: (Video) Color used during fade out (e.g., 'black', '#000000').
    *   - **stream**: Which stream to apply the fade ('audio' | 'video').
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#afade FFmpeg afade filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#fade FFmpeg fade filter documentation}
    */
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

   /**
    * Crops the input video to a specific region or aspect ratio.
    *
    * @param options - Options object with the following keys:
    *   - **width**: Desired width of the output (e.g., 640 or "iw/2").
    *   - **height**: Desired height of the output (e.g., 360 or "ih/2").
    *   - **x**: Horizontal offset of the cropped region (e.g., 100 or "(in_w-out_w)/2").
    *   - **y**: Vertical offset of the cropped region (e.g., 50 or "(in_h-out_h)/2").
    *   - **aspectRatio**: Optional aspect ratio (e.g., "16:9", "4:3") to enforce.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#crop FFmpeg crop filter documentation}
    */
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

   /**
    * Resizes the input video with flexible scaling options.
    * Allows for absolute or relative dimensions, and supports aspect ratio preservation and scaling quality flags.
    *
    * @param options - Options object with the following keys:
    *   - **width** & **height**: Output size (e.g., 1280, "iw/2", -2 to preserve aspect ratio).
    *   - **percentage**: Resize by percent (overrides width/height).
    *   - **forceAspectRatio**: Ensures aspect ratio is preserved ("increase", "decrease", or "disable").
    *   - **flags**: Sets the scaling algorithm (e.g., "bicubic", "lanczos").
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#scale FFmpeg scale filter documentation}
    */
   scale(options: ScaleOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'scale');
      }

      const { videoFilter } = ScaleFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Reverses the audio and/or video streams.
    *
    * @param options Specifies which stream to reverse ('audio', 'video', or undefined for both).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#reverse FFmpeg reverse filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#areverse FFmpeg areverse filter documentation}
    */
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

   /**
    * Changes the speed of the audio and/or video streams.
    *
    * @param factor - The speed factor.
    *               - `1`: No change.
    *               - `>1`: Faster.
    *               - `<1`: Slower.
    *               - `<0`: Reverse and change speed.
    *               - `0`: throws an error.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#setpts FFmpeg setpts filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#atempo FFmpeg atempo filter documentation}
    */
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

   /**
    * Applies a Gaussian blur to the video stream.
    *
    * @param radius - The blur radius (sigma). Higher values mean more blur.
    * @default 3
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#gblur FFmpeg gblur filter documentation}
    */
   blur(radius: number = 3): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'blur');
      }

      const { videoFilter } = BlurFilter(radius);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Flips the video stream horizontally, vertically, or both.
    *
    * @param axis - The flip axis ('horizontal', 'vertical', or 'both').
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#hflip FFmpeg hflip filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#vflip FFmpeg vflip filter documentation}
    */
   flip(axis: FlipOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'flip');
      }

      const { videoFilter } = FlipFilter(axis);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Applies a denoising filter to the audio and/or video streams.
    *
    * @param method - The denoising method.
    *               - **'hqdn3d'**: High-quality 3D denoiser.
    *               - **'nlmeans'**: Non-local means denoiser.
    *               - **'atadenoise'**: Adaptive temporal averaging denoiser.
    *               - **'afftdn'**: Adaptive frequency-domain temporal denoiser (audio only).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream, depending on the method.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#hqdn3d FFmpeg hqdn3d filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#nlmeans FFmpeg nlmeans filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#atadenoise FFmpeg atadenoise filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#afftdn FFmpeg afftdn filter documentation}
    */
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

   /**
    * Rotates the input video by a fixed degree or dynamic expression.
    * Supports static angles in degrees or animated rotations using FFmpeg expressions.
    * You can also control the output dimensions and background fill color.
    *
    * @param options - Rotation options:
    *   - **degrees**: Static angle in degrees (-360 to 360).
    *   - **expression**: Dynamic rotation in radians (e.g., `"t/5"` for time-based rotation).
    *   - **outputWidth/outputHeight**: Output size expressions (e.g., `"rotw(a)"`, `"roth(a)"`).
    *   - **emptyAreaColor**: Fill color for uncovered regions (e.g., `"black"`, `"white@0.5"`).
    *
    * If both `degrees` and `expression` are defined, `expression` takes precedence.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#rotate FFmpeg rotate filter documentation}
    */
   rotate(options: RotateOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'rotate');
      }

      const { videoFilter } = RotateFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Adjusts the alpha (transparency) of the video stream.
    *
    * @param value - The alpha value (0 for fully transparent, 1 for fully opaque).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#colorchannelmixer FFmpeg colorchannelmixer filter documentation}
    */
   alpha(value: number): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'alpha');
      }

      const { videoFilter } = AlphaFilter(value);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Adds padding to the input image and positions the original content
    * at the specified (x, y) coordinates within the padded canvas.
    *
    * @param options - Options object with the following keys:
    *   - **width**: Specifies the width of the output image after padding.
    *   - **height**: Specifies the height of the output image after padding.
    *   - **color**: Sets the background color used for the padded area.
    *   - **x**: Horizontal offset for placing the input image.
    *   - **y**: Vertical offset for placing the input image.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#pad FFmpeg pad filter documentation}
    */
   pad(options: PadOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'pad');
      }

      const { videoFilter } = PadFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Delays the audio and/or video streams.
    *
    * @param seconds - The delay in seconds.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio or video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#asetpts FFmpeg asetpts filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#setpts FFmpeg setpts filter documentation}
    */
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

   /**
    * Negates (inverts) the colors of the video stream.
    *
    * @param alpha - If true, also negate the alpha channel.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#negate FFmpeg negate filter documentation}
    */
   negate(alpha: boolean = false): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'negate');
      }

      const { videoFilter } = NegateFilter(alpha);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Converts the video stream to grayscale.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#format FFmpeg format filter documentation}
    */
   grayscale(): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'grayscale');
      }

      const { videoFilter } = GrayscaleFilter();
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Applies basic color adjustments to the input video, including brightness,
    * contrast, saturation, and approximate gamma correction.
    *
    * @param options - Adjustment options with the following keys:
    *   - **brightness**: Adjusts overall brightness (-1.0 to 1.0).
    *   - **contrast**: Adjusts contrast level (-1000.0 to 1000.0).
    *   - **saturation**: Adjusts color saturation (0.0 to 3.0).
    *   - **gamma**: Adjusts gamma correction (0.1 to 10.0).
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#eq FFmpeg eq filter documentation}
    */
   brightness(options: BrightnessOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'brightness');
      }

      const { videoFilter } = BrightnessFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Adjusts the hue, saturation, and brightness of the video stream.
    *
    * @param options - Adjustment options with the following keys:
    *   - **degrees**: Hue rotation angle in degrees (-360 to 360).
    *   - **expression**: Hue rotation angle in radians (-π to π).
    *   - **saturation**: Saturation multiplier (-10.0 to 10.0).
    *   - **brightness**: Brightness adjustment level (-10.0 to 10.0).
    *
    * If both `degrees` and `expression` are defined, `expression` takes precedence.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#hue FFmpeg hue filter documentation}
    */
   hue(options: HueOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'hue');
      }

      const { videoFilter } = HueFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Adjusts the intensity balance of primary colors (red, green, blue) in input frames.
    * You can independently control color balance in the shadows, midtones, and highlights
    * for red-cyan, green-magenta, and blue-yellow channels.
    * Positive values shift toward the primary color; negative values toward the complementary.
    *
    * @param options - The color balance options with the following keys:
    *   - **redShadows**, **greenShadows**, **blueShadows**
    *   - **redMidtones**, **greenMidtones**, **blueMidtones**
    *   - **redHighlights**, **greenHighlights**, **blueHighlights**
    *   - **preserveLightness**
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @throws {NoParametersError} If no parameters are provided.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#colorbalance FFmpeg colorbalance filter documentation}
    */
   colorBalance(options: ColorBalanceOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorbalance');
      }

      const { videoFilter } = ColorBalanceFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Adjusts video frames by re-mixing color channels.
    * Each output channel is a weighted sum of the input channels,
    * allowing custom color transformations.
    *
    * @param options - The color channel mixer options. The available properties are:
    *   - `redInRed`: Adjusts the red channel contribution to the output red channel.
    *   - `redInGreen`: Adjusts the red channel contribution to the output green channel.
    *   - `redInBlue`: Adjusts the red channel contribution to the output blue channel.
    *   - `redInAlpha`: Adjusts the red channel contribution to the output alpha channel.
    *   - `greenInRed`: Adjusts the green channel contribution to the output red channel.
    *   - `greenInGreen`: Adjusts the green channel contribution to the output green channel.
    *   - `greenInBlue`: Adjusts the green channel contribution to the output blue channel.
    *   - `greenInAlpha`: Adjusts the green channel contribution to the output alpha channel.
    *   - `blueInRed`: Adjusts the blue channel contribution to the output red channel.
    *   - `blueInGreen`: Adjusts the blue channel contribution to the output green channel.
    *   - `blueInBlue`: Adjusts the blue channel contribution to the output blue channel.
    *   - `blueInAlpha`: Adjusts the blue channel contribution to the output alpha channel.
    *   - `alphaInRed`: Adjusts the alpha channel contribution to the output red channel.
    *   - `alphaInGreen`: Adjusts the alpha channel contribution to the output green channel.
    *   - `alphaInBlue`: Adjusts the alpha channel contribution to the output blue channel.
    *   - `alphaInAlpha`: Adjusts the alpha channel contribution to the output alpha channel.
    *   - `preserveColorMode`: Defines how colors are preserved during processing. Options: 'none', 'lum', 'max', 'avg', 'sum', 'nrm', 'pwr'.
    *   - `preserveColorAmount`: Sets the amount of color preservation (range: 0.0 to 1.0).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @throws {NoParametersError} If no parameters are provided.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#colorchannelmixer FFmpeg colorchannelmixer filter documentation}
    */
   colorMixer(options: ColorChannelMixerOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorchannelmixer');
      }

      const { videoFilter } = ColorChannelMixerFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Applies a color preset (lookup table) to the video stream.
    *
    * Available presets:
    * - `'sepia'`
    * - `'golden hour'`
    * - `'purple noir'`
    * - `'grayscale'`
    * - `'moonlight'`
    * - `'teal & orange'`
    * - `'vibrant'`
    * - `'desaturated'`
    * - `'negative'`
    * - `'matrix code green'`
    * - `'cyberpunk'`
    * - `'vintage film'`
    *
    * @param preset - The name of the color preset to apply.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#lutrgb FFmpeg lutrgb filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#lutyuv FFmpeg lutyuv filter documentation}
    */
   colorPreset(preset: ColorPresetValues): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorpreset[lutrgb]');
      }

      const { videoFilter } = LutFilter(preset);
      this.addVideoFilter(videoFilter);
      return this;
   }
   /**
    * Apply a look-up table (LUT) to each RGB pixel component.
    * Maps input values to output values using user-defined expressions.
    * Useful for color grading and effects.
    *
    * Options can include:
    * - `red`   → Expression or multiplier for red channel
    * - `green` → Expression or multiplier for green channel
    * - `blue`  → Expression or multiplier for blue channel
    * - `alpha` → Expression or multiplier for alpha channel
    *
    * @param options - Channel expressions or multipliers.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @throws {NoParametersError} If no parameters are provided.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#lutrgb FFmpeg lutrgb filter documentation}
    */
   colorMultiplier(options: ColorMultiplierOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colormultiplier[lutrgb]');
      }

      const { videoFilter } = ColorMultiplierFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Attempt to reduce small horizontal and/or vertical shifts caused by camera shake.
    * Useful for stabilizing footage taken handheld, on a moving vehicle, or with an unstable tripod.
    *
    * @param options - Deshake options including region size (`width`, `height`), position (`x`, `y`), motion range (`rangeX`, `rangeY`), edge behavior, and tuning (`blocksize`, `contrast`).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#deshake FFmpeg deshake filter documentation}
    */
   deshake(options?: DeshakeOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'deshake');
      }

      const { videoFilter } = DeshakeFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Remap and mix input audio channels with custom gain levels into a specified output layout.
    * Useful for channel remixing, downmixing, or upmixing audio streams.
    * Accepts an output channel layout followed by individual channel mapping definitions.
    *
    * @param options - The pan options, including the output channel layout (`layout`) and channel mappings (`channels`).
    * - `layout`: Defines the audio channel layout (e.g., 'mono', 'stereo', '5.1', '7.1').
    * - `channels`: Array defining how channels are mapped and mixed, where each element is either a gain value (e.g., `0.5`) or a mapping expression (e.g., `"FL=c0+0.5c1"`).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#pan FFmpeg pan filter documentation}
    */
   pan(options: PanOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'pan');
      }

      const { audioFilter } = PanFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Draws a text string and overlays it onto the video using the libfreetype library.
    * Useful for subtitles, watermarks, timestamps, or dynamic text rendering.
    *
    * @param options - The drawtext options, including:
    * - `text`: The text to be drawn.
    * - `textAlign`: Horizontal and vertical alignment of the text.
    * - `lineSpacing`: Spacing between lines of text (for multi-line rendering).
    * - `fontFile`: Path to the font file to be used.
    * - `fontSize`: Font size (can be a number or string).
    * - `fontColor`: Color used to render the text.
    * - `x`, `y`: Position of the text on the video.
    * - `borderWidth`, `borderColor`: Border width and color around the text.
    * - `shadowX`, `shadowY`, `shadowColor`: Shadow offset and color.
    * - `box`, `boxColor`: Enable or disable box around the text and its color.
    * - `boxBorderWidth`: Set the width of the border around the text box.
    * - `enable`: Condition to enable/disable drawing the text.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#drawtext FFmpeg drawtext filter documentation}
    */
   drawText(options: DrawTextOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'drawtext');
      }

      const { videoFilter } = DrawTextFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Draws a colored box on the input video frame.
    * Commonly used for highlighting regions, annotations, or visual markers in a video.
    *
    * @param options - The drawbox options, including:
    * - `x`, `y`: Position of the top-left corner (can be number or expression).
    * - `width`, `height`: Size of the box (can be number or expression).
    * - `fillColor`: Background color of the box.
    * - `borderColor`: Color of the box border.
    * - `thickness`: Border thickness (set to `fillColor` fill when 0).
    * - `enable`: Expression or flag to conditionally draw the box.
    *
    * Expressions can reference FFmpeg variables like `in_w`, `in_h`, `dar`, etc.
    *
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#drawbox FFmpeg drawbox filter documentation}
    */
   drawBox(options: DrawBoxOptions): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'drawbox');
      }

      const { videoFilter } = DrawBoxFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }
}

/*

//    subtitles
//    alphamerge
//    overlay
//    blend
//    stack
//    amerge
//    amix
//    concat
//    crossfade


export interface OverlayOptions {
   x: string | number;
   y: string | number;
   enable?: string | number | boolean;
}

*/
