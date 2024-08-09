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
   VolumeOptions,
} from '@/types/filters';

// @utils
import { MissingStreamError } from '@/utils/errors';

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
    * For detailed descriptions of each property, see {@link VolumeOptions}.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#volume FFmpeg volume filter documentation}
    */
   volume(options: VolumeOptions): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'volume');
      }

      const { audioFilter } = VolumeFilter(options);
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
    * For detailed descriptions of each property, see {@link LoudnormOptions}.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#loudnorm FFmpeg loudnorm filter documentation}
    */
   loudnorm(options: LoudnormOptions = { average: -23, range: 9, peak: -1 }): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'loudnorm');
      }

      const { audioFilter } = LoudnormFilter(options);
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
    * For detailed descriptions of each property, see {@link DynaudnormOptions}.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have an audio stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#dynaudnorm FFmpeg dynaudnorm filter documentation}
    */
   dynaudnorm(options: DynaudnormOptions = { frameLength: 200, peak: 0.9 }): this {
      if (!this.hasAudioStream()) {
         throw new MissingStreamError('audio', 'dynaudnorm');
      }

      const { audioFilter } = DynaudnormFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }

   /**
    * Changes the pitch of the audio without altering its duration.
    * Increases or decreases the sampling rate by a given factor, then resamples to the original rate
    * and compensates playback speed to maintain original timing.
    *
    * @param factor Pitch shift multiplier. Values >1 increase pitch, <1 decrease it.
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

      const { summary } = this.getMetadata();
      const sampleRate = summary.audioSampleRate || 44100;
      const { audioFilter } = PitchFilter(factor, sampleRate);
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
    * For detailed descriptions of each property, see {@link TrimOptions}.
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
    * For detailed descriptions of each property, see {@link FadeOptions}.
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
    * For detailed descriptions of each property, see {@link CropOptions}.
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
    * For detailed descriptions of each property, see {@link ScaleOptions}.
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
    * For detailed property descriptions, see {@link RotateOptions}.
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
    * For detailed descriptions of each property, see {@link PadOptions}.
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
    * Adjusts the brightness, contrast, saturation, and gamma of the video stream.
    * @param options - The brightness adjustment options.
    * @param options.brightness - The brightness adjustment value.
    * @param options.contrast - The contrast adjustment value.
    * @param options.saturation - The saturation adjustment value.
    * @param options.gamma - The gamma adjustment value.
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
    * @param options - The hue adjustment options.
    * @param options.degrees - The hue rotation angle in degrees.
    * @param options.expression - A string expression for dynamic hue rotation.
    * @param options.saturation - The saturation adjustment value.
    * @param options.brightness - The brightness adjustment value.
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
    * Adjusts the color balance of the video stream.
    * @param options - The color balance options.
    * @param options.redShadows - The red shadows adjustment value.
    * @param options.greenShadows - The green shadows adjustment value.
    * @param options.blueShadows - The blue shadows adjustment value.
    * @param options.redMidtones - The red midtones adjustment value.
    * @param options.greenMidtones - The green midtones adjustment value.
    * @param options.blueMidtones - The blue midtones adjustment value.
    * @param options.redHighlights - The red highlights adjustment value.
    * @param options.greenHighlights - The green highlights adjustment value.
    * @param options.blueHighlights - The blue highlights adjustment value.
    * @param options.preserveLightness - Preserve lightness (true/false).
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
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
    * Adjusts the color channel mixing of the video stream.
    * @param options - The color channel mixer options.
    * @param options.redInRed - The red channel contribution to the red output.
    * @param options.redInGreen - The green channel contribution to the red output.
    * @param options.redInBlue - The blue channel contribution to the red output.
    * @param options.redInAlpha - The alpha channel contribution to the red output.
    * @param options.greenInRed - The red channel contribution to the green output.
    * @param options.greenInGreen - The green channel contribution to the green output.
    * @param options.greenInBlue - The blue channel contribution to the green output.
    * @param options.greenInAlpha - The alpha channel contribution to the green output.
    * @param options.blueInRed - The red channel contribution to the blue output.
    * @param options.blueInGreen - The green channel contribution to the blue output.
    * @param options.blueInBlue - The blue channel contribution to the blue output.
    * @param options.blueInAlpha - The alpha channel contribution to the blue output.
    * @param options.alphaInRed - The red channel contribution to the alpha output.
    * @param options.alphaInGreen - The green channel contribution to the alpha output.
    * @param options.alphaInBlue - The blue channel contribution to the alpha output.
    * @param options.alphaInAlpha - The alpha channel contribution to the alpha output.
    * @param options.preserveColorMode - The color preservation mode.
    * @param options.preserveColorAmount - The color preservation amount.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
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
    * @param options - The color preset name.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#lutrgb FFmpeg lutrgb filter documentation}
    * @see {@link https://ffmpeg.org/ffmpeg-filters.html#lutyuv FFmpeg lutyuv filter documentation}
    */
   colorPreset(options: ColorPresetValues): this {
      if (!this.hasVideoStream()) {
         throw new MissingStreamError('video', 'colorpreset[lutrgb]');
      }

      const { videoFilter } = LutFilter(options);
      this.addVideoFilter(videoFilter);
      return this;
   }

   /**
    * Multiplies the color channels of the video stream.
    * @param options - The color multiplier options.
    * @param options.red - The red channel multiplier.
    * @param options.green - The green channel multiplier.
    * @param options.blue - The blue channel multiplier.
    * @param options.alpha - The alpha channel multiplier.
    * @returns The MediaEditor instance for method chaining.
    * @throws {MissingStreamError} If the input media does not have a video stream.
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
    * Applies a deshake filter to the video stream.
    * @param options - The deshake options.
    * @param options.x - The x-coordinate of the reference point.
    * @param options.y - The y-coordinate of the reference point.
    * @param options.width - The width of the search area.
    * @param options.height - The height of the search area.
    * @param options.rangeX - The maximum horizontal shift.
    * @param options.rangeY - The maximum vertical shift.
    * @param options.edge - The edge handling method.
    * @param options.blocksize - The block size.
    * @param options.contrast - The contrast threshold.
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
    * Applies a pan filter to the audio stream.
    * @param options - The pan options.
    * @param options.layout - The output layout ('mono', 'stereo', '5.1', '7.1').
    * @param options.channels - The channel mapping (e.g., ['c0', 'c1'] for stereo).
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
    * Draws text on the video stream.
    * @param options - The drawtext options.
    * @param options.text - The text to draw.
    * @param options.textAlign - The text alignment.
    * @param options.lineSpacing - The line spacing.
    * @param options.fontFile - The path to the font file.
    * @param options.fontSize - The font size.
    * @param options.fontColor - The font color.
    * @param options.x - The x-coordinate of the text. Can be a number or a string expression.
    * @param options.y - The y-coordinate of the text. Can be a number or a string expression.
    * @param options.box - If true, draw a box around the text.
    * @param options.boxColor - The box color.
    * @param options.boxBorderWidth - The box border width.
    * @param options.alpha - The alpha value of the text (0 for fully transparent, 1 for fully opaque).
    * @param options.enable - A string expression to enable/disable the text drawing dynamically.
    * @param options.fixBounds - If true, fix the text bounds.
    * @param options.reloadFonts - If true, reload the fonts.
    * @param options.shadowX - The x-offset of the text shadow.
    * @param options.shadowY - The y-offset of the text shadow.
    * @param options.shadowColor - The color of the text shadow.
    * @param options.shadowAlpha - The alpha value of the text shadow.
    * @param options.borderW - The border width.
    * @param options.borderColor - The border color.
    * @param options.expansion - The expansion of the text.
    * @param options.startNumber - The start number for the text.
    * @param options.timecode - The timecode format.
    * @param options.timecodeRate - The timecode rate.
    * @param options.textfile - The path to the text file.
    * @param options.textfileReload - If true, reload the text file.
    * @param options.font - The font family.
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
    * Draws a box on the video stream.
    * @param options - The drawbox options.
    * @param options.x - The x-coordinate of the top-left corner of the box. Can be a number or a string expression.
    * @param options.y - The y-coordinate of the top-left corner of the box. Can be a number or a string expression.
    * @param options.width - The width of the box. Can be a number or a string expression.
    * @param options.height - The height of the box. Can be a number or a string expression.
    * @param options.color - The color of the box.
    * @param options.thickness - The thickness of the box border.
    * @param options.replace - If true, replace the pixels inside the box with the specified color.
    * @param options.enable - A string expression to enable/disable the box drawing dynamically.
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

new MediaEditor('');

/*
UNIONES EN:

- trim (duration | end)
- crop (aspect ratio | h,w)
- scale (percentage)
- rotate (degrees | expression)
*/
