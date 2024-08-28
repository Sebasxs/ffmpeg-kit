import { FFmpegColor, AspectRatios, Curves, ColorPresets } from '@/lib/constants';

interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

export type StreamConstraint = 'audio' | 'video';

type RequiredFilterOutput<T extends keyof FilterOuput> = Required<Pick<FilterOutput, T>>;

export interface VolumeOptions {
   /**
    * Sets the volume level to be applied to the audio stream.
    * Can be a numeric value or a string expression.
    *
    * @example
    * 1.0 // no change
    * 2.0 // double the volume
    * 'if(lt(t,10),1,max(1-(t-10)/5,0))' // reduce volume progressively after 10 seconds played
    */
   volume: number | string;
   /**
    * Sets the evaluation mode for the volume filter.
    * Determines how often the volume expression is evaluated.
    * 'once' evaluates once at the beginning, while 'frame' evaluates for each frame.
    *
    * @default 'once'
    */
   _eval?: 'once' | 'frame';
}

export interface VolumeBuilder {
   (options: VolumeOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface LoudnormOptions {
   /**
    * Sets the integrated loudness target level in LUFS (Loudness Units relative to Full Scale).
    *
    * This value determines the overall loudness the filter will normalize the audio to,
    * according to the EBU R128 standard.
    *
    * @range -70.0 to -5.0
    * @default -23.0
    */
   average?: number;
   /**
    * Sets the target loudness range (LRA) in LU (Loudness Units).
    *
    * This defines the allowed dynamic range of the output signal. The filter will attempt to
    * compress or expand the dynamics to match this target range while preserving overall balance.
    *
    * @range 1.0 to 50.0
    * @default 9.0
    */
   range?: number;
   /**
    * Sets the maximum allowed true peak level in dBTP (decibels True Peak).
    *
    * This limits the highest peak that the signal can reach after normalization, helping to prevent
    * digital clipping during playback or encoding.
    *
    * @range -9.0 to 0.0
    * @default -1.0
    */
   peak?: number;
}

export interface LoudnormBuilder {
   (options: LoudnormOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface DynaudnormOptions {
   /**
    * Sets the frame length in milliseconds for the Dynamic Audio Normalizer.
    * Audio is processed in small chunks (frames) to compute peak magnitudes over time.
    * A frame defines the duration over which normalization is applied, rather than across the entire file.
    * The actual number of samples per frame is determined by the input's sampling rate.
    *
    * @range 10 to 8000 (milliseconds)
    * @default 200
    */
   frameLength?: number;
   /**
    * Sets the Gaussian filter window size, in frames, used for smoothing gain levels.
    * Must be an odd number to center the window around the current frame.
    * Larger values result in smoother, slower gain changes (like traditional normalization),
    * while smaller values lead to faster gain adaptation (like a compressor).
    *
    * @range 3 to 301 (odd numbers only)
    * @default 31
    */
   gaussSize?: number;
   /**
    * Sets the target peak value, defining the maximum allowed amplitude after normalization.
    * The filter attempts to approach this value closely without exceeding it.
    * Higher values reduce headroom, increasing the risk of clipping.
    *
    * @range 0.0 to 1.0
    * @default 0.9
    */
   peak?: number;
   /**
    * Sets the global maximum gain factor allowed per frame to prevent over-amplification.
    * Limits the gain in very quiet frames to avoid unnatural volume spikes.
    * A smooth sigmoid threshold is used instead of a hard cutoff.
    *
    * @range 1.0 to 100.0
    * @default 10.0
    */
   maxGain?: number;
   /**
    * Sets the target RMS (Root Mean Square) level to normalize perceived loudness instead of just peak values.
    * If set above 0.0, gain is adjusted to match the specified RMS while still avoiding clipping.
    * When set to 0.0, RMS-based normalization is disabled and only peak normalization is used.
    *
    * @range 0.0 to 1.0
    * @default 0.0
    */
   rms?: number;
   /**
    * Sets the compression factor to apply soft-knee thresholding before normalization.
    * Enables dynamic compression to reduce peaks and limit dynamic range.
    * Lower values apply stronger compression, but values below 3.0 may cause distortion.
    * When set to 0.0, compression is disabled.
    *
    * @range 0.0 to 30.0
    * @default 0.0
    */
   compress?: number;
   /**
    * Sets the minimum input magnitude required for a frame to be normalized.
    * Frames below this threshold may be skipped to avoid amplifying digital noise.
    * A value of 0.0 means all frames are normalized regardless of input level.
    *
    * @range 0.0 to 1.0
    * @default 0.0
    */
   threshold?: number;
}

export interface DynaudnormBuilder {
   (options: DynaudnormOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface PitchBuilder {
   (factor: number, sampleRate: number): RequiredFilterOutput<'audioFilter'>;
}

export type TrimOptions = {
   /**
    * Specifies which stream to trim ('audio', 'video', or undefined for both).
    */
   stream?: StreamConstraint;
   /**
    * Sets the start time of the trimmed output. The frame with this timestamp will be the first in the result.
    * Time can be specified using FFmpeg's duration syntax.
    *
    * @example
    * '00:00:30' // starts output at 30 seconds
    * 12 // starts output at 12 seconds
    */
   start: string | number;
   /**
    * Sets the end time of the trimmed output. The frame with this timestamp will be the last in the result.
    * Time can be specified using FFmpeg's duration syntax.
    *
    * @example
    * '00:01:30' // ends output at 1 minute 30 seconds
    * 120 // ends output at 120 seconds
    */
   end?: string | number;
   /**
    * Sets the maximum duration of the output segment.
    * Limits how long the trimmed output will be, starting from the defined `start` time.
    *
    * @example
    * '00:00:10' // limits output to 10 seconds
    * 5 // limits output to 5 seconds
    */
   duration?: string | number;
};

export interface TrimBuilder {
   (options): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface FadeOptions {
   /**
    * Sets the fade effect type.
    * Use "in" to gradually reveal the video or "out" to gradually hide it.
    *
    * @default 'in'
    */
   type: 'in' | 'out';
   /**
    * Sets the duration (in seconds) of the fade effect.
    * Overrides `nb_frames` if both are specified.
    * After fade-in, the video reaches full intensity; after fade-out, it transitions to the chosen color.
    *
    * @range ≥ 0
    * @default 0
    */
   duration: number;
   /**
    * Sets the start time (in seconds) for the fade effect.
    * If both `start_time` and `start_frame` are set, the fade starts at the later of the two.
    * Uses FFmpeg time duration format (e.g., "5", "00:00:05.0").
    *
    * @range ≥ 0
    * @default 0
    */
   start?: number;
   /**
    * **Audio**
    *
    * Sets the curve shape for the fade transition.
    * Controls how the fade progresses over time (e.g., linear, quadratic, etc.).
    *
    * @example
    * 'quadratic' // applies a quadratic easing to the fade
    */
   curve?: (typeof Curves)[number];
   /**
    * **Video**
    *
    * Sets the color used for the fade effect.
    *
    * @range any valid FFmpeg color string
    * @default black
    * @example
    * 'black' // sets the background color to black
    * 'white@0.5' // sets the background color to white with 50% transparency
    * '#000000' // sets the background color to black using hex code
    */
   color?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Specifies which stream to fade ('audio', 'video', or undefined for both).
    */
   stream?: StreamConstraint;
}

export interface FadeBuilder {
   (options: Omit<FadeOptions, 'stream'>): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface CropOptions {
   /**
    * Sets the output video width.
    * Evaluated once during filter initialization or when updated via command.
    *
    * @range Any positive integer or expression (e.g., "iw/2")
    * @default iw
    */
   width?: string | number;
   /**
    * Sets the output video height.
    * Evaluated once during filter initialization or when updated via command.
    *
    * @range Any positive integer or expression (e.g., "ih/2")
    * @default ih
    */
   height?: string | number;
   /**
    * Horizontal position of the left edge of the output within the input.
    * Evaluated per frame.
    *
    * @range Any integer or expression (e.g., "(in_w-out_w)/2")
    * @default (in_w-out_w)/2
    */
   x?: string | number;
   /**
    * Vertical position of the top edge of the output within the input.
    * Evaluated per frame.
    *
    * @range Any integer or expression (e.g., "(in_h-out_h)/2")
    * @default (in_h-out_h)/2
    */
   y?: string | number;
   /**
    * Sets the aspect ratio of the output video.
    * If set, the filter will adjust the output dimensions to match the specified aspect ratio.
    *
    * @example
    * '16:9' // sets the aspect ratio to 16:9
    * '4:3' // sets the aspect ratio to 4:3
    */
   aspectRatio?: (typeof AspectRatios)[number] | (string & {});
}

export interface CropBuilder {
   (
      options: CropOptions,
      inputWidth?: number,
      inputHeight?: number,
   ): RequiredFilterOutput<'videoFilter'>;
}

export interface ScaleOptions {
   /**
    * Sets the output video width expression.
    * If set to 0, uses input width. If set to -n (n >= 1), preserves aspect ratio based on width,
    * rounding the result to a multiple of n.
    * If both width and height are -n, input dimensions are used.
    *
    * @range 0, any positive integer, or -n where n >= 1
    * @default in_w
    */
   width?: number | string;
   /**
    * Sets the output video height expression.
    * If set to 0, uses input height. If set to -n (n >= 1), preserves aspect ratio based on width,
    * rounding the result to a multiple of n.
    * If both width and height are -n, input dimensions are used.
    *
    * @range 0, any positive integer, or -n where n >= 1
    * @default in_h
    */
   height?: number | string;
   /**
    * Sets the scaling percentage for both width and height.
    * If set, overrides width and height settings.
    * The percentage is applied to both dimensions, preserving the aspect ratio.
    *
    * @range 10 to 200
    * @default 100
    */
   percentage?: number;
   /**
    * Adjusts output dimensions to preserve the original aspect ratio.
    * Requires explicitly setting both width and height.
    *
    * - 'disable': No adjustment.
    * - 'decrease': Shrinks dimensions if needed to fit.
    * - 'increase': Expands dimensions if needed to fit.
    *
    * Useful for fitting within max resolutions while maintaining aspect ratio.
    *
    * @range "disable" | "decrease" | "increase"
    * @default disable
    */
   forceAspectRatio?: 'decrease' | 'increase' | 'disable';
   /**
    * Sets libswscale scaling algorithm flags.
    * Controls quality and performance tradeoffs during scaling.
    * See the ffmpeg-scaler manual for available options (e.g., "bilinear", "bicubic", "lanczos").
    *
    * @default bicubic
    */
   flags?: 'bilinear' | 'bicubic' | 'lanczos' | 'gaussian';
}

export interface ScaleBuilder {
   (options: ScaleOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface ReverseOptions {
   /**
    * Specifies which stream to reverse ('audio', 'video', or undefined for both).
    */
   stream?: StreamConstraint;
}

export interface ReverseBuilder {
   (options?: ReverseOptions): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface SpeedBuilder {
   (factor: number): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface BlurBuilder {
   (radius: number): RequiredFilterOutput<'videoFilter'>;
}

export type FlipOptions = 'horizontal' | 'vertical' | 'both';

export interface FlipBuilder {
   (options: FlipOptions): RequiredFilterOutput<'videoFilter'>;
}

export type DenoiseOptions = 'hqdn3d' | 'nlmeans' | 'atadenoise' | 'afftdn';

export interface DenoiseBuilder {
   (method: DenoiseOptions): RequiredFilterOutput<'videoFilter' | 'audioFilter'>;
}

export interface RotateOptions {
   /**
    * Specifies the rotation angle in degrees.
    * Positive values rotate clockwise, negative values rotate counterclockwise.
    *
    * Note: `degrees` and `expression` are mutually exclusive and cannot be specified together.
    *
    * @range -360 to 360
    * @default 0
    */
   degrees?: number;
   /**
    * Sets the rotation angle in radians. Positive values rotate clockwise; negative values counter-clockwise.
    * Evaluated per frame, allows dynamic rotation based on frame count or time.
    *
    * Supports expressions with constants like `n` (frame index), `t` (time in seconds), and functions like `rotw(a)` and `roth(a)` for calculating output size.
    *
    * Note: `degrees` and `expression` are mutually exclusive and cannot be specified together.
    *
    * @range Any float expression (e.g., "PI/4", "-t/10")
    * @default 0
    */
   expression?: string;
   /**
    * Sets the output width expression for the rotated video.
    * Evaluated once during filter initialization.
    *
    * @range Any positive integer or expression (e.g., "rotw(a)")
    * @default iw
    */
   outputWidth?: number | string;
   /**
    * Sets the output height expression for the rotated video.
    * Evaluated once during filter initialization.
    *
    * @range Any positive integer or expression (e.g., "roth(a)")
    * @default ih
    */
   outputHeight?: number | string;
   /**
    * Sets the fill color for areas not covered by the rotated image.
    * @range any valid ffmpeg color string or "none" for transparency.
    * @default black
    * @example
    * 'black' // sets the background color to black
    * 'white@0.5' // sets the background color to white with 50% transparency
    * '#000000' // sets the background color to black using hex code
    */
   emptyAreaColor?: (typeof FFmpegColor)[number] | (string & {});
}

export interface RotateBuilder {
   (options: RotateOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface AlphaBuilder {
   (value: number): RequiredFilterOutput<'videoFilter'>;
}

export interface PadOptions {
   /**
    * Specifies the width of the output image after padding.
    * Accepts expressions that can reference both input and output dimensions,
    * including constants like `in_w`, `iw`, `out_h`, `oh`, `a`, `sar`, `dar`, `x`, and `y`.
    * If set to 0, the input width is used.
    *
    * @range 0 or any valid expression using input/output dimension constants
    * @default 0
    */
   width: number | string;
   /**
    * Specifies the height of the output image after padding.
    * Accepts expressions that can reference both input and output dimensions,
    * including constants like `in_h`, `ih`, `out_w`, `ow`, `a`, `sar`, `dar`, `x`, and `y`.
    * If set to 0, the input height is used.
    *
    * @range 0 or any valid expression using input/output dimension constants
    * @default 0
    */
   height: number | string;
   /**
    * Sets the background color used for the padded area.
    *
    * @range any valid FFmpeg color string
    * @default black
    * @example
    * 'black' // sets the background color to black
    * 'white@0.5' // sets the background color to white with 50% transparency
    * '#000000' // sets the background color to black using hex code
    */
   color?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Horizontal offset to place the input image within the padded area, relative to the left border.
    * Accepts expressions that can reference input/output dimensions and `y`.
    * If the result is negative, the input image will be horizontally centered.
    *
    * @range any valid expression; negative values center the image
    * @default 0
    */
   x?: number | string;
   /**
    * Vertical offset to place the input image within the padded area, relative to the top border.
    * Accepts expressions that can reference input/output dimensions and `x`.
    * If the result is negative, the input image will be vertically centered.
    *
    * @range any valid expression; negative values center the image
    * @default 0
    */
   y?: number | string;
}

export interface PadBuilder {
   (options: PadOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface DelayBuilder {
   (seconds: number): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface NegateBuilder {
   (alpha?: boolean): RequiredFilterOutput<'videoFilter'>;
}

export interface GrayscaleBuilder {
   (): RequiredFilterOutput<'videoFilter'>;
}

export interface BrightnessOptions {
   /**
    * Sets the brightness adjustment level.
    * A value of 0 means no change; negative values darken the image, positive values brighten it.
    *
    * @range -1.0 to 1.0
    * @default 0
    */
   brightness?: number | string;
   /**
    * Sets the contrast adjustment level.
    * A value of 1.0 means no change; lower values decrease contrast, higher values increase it.
    *
    * @range -1000.0 to 1000.0
    * @default 1.0
    */
   contrast?: number | string;
   /**
    * Sets the saturation adjustment level.
    * A value of 1.0 means no change; lower values desaturate the image, higher values increase color intensity.
    *
    * @range 0.0 to 3.0
    * @default 1.0
    */
   saturation?: number | string;
   /**
    * Sets the gamma correction level.
    * A value of 1.0 means no change; lower values darken midtones, higher values brighten them.
    *
    * @range 0.1 to 10.0
    * @default 1.0
    */
   gamma?: number | string;
}

export interface BrightnessBuilder {
   (options: BrightnessOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface HueOptions {
   /**
    * Sets the hue rotation angle in degrees.
    * Accepts an expression; positive values rotate hues clockwise on the color wheel.
    * Note: `degrees` and `expression` are mutually exclusive and cannot be specified together.
    *
    * @range -360 to 360
    * @default 0
    */
   degrees?: number;
   /**
    * Sets the hue rotation angle in radians.
    * Accepts an expression; positive values rotate hues clockwise on the color wheel.
    * Note: `degrees` and `expression` are mutually exclusive and cannot be specified together.
    *
    * @range -π to π (radians)
    * @default 0
    */
   expression?: string;
   /**
    * Sets the saturation multiplier.
    * Accepts an expression; values below 1.0 reduce saturation, above 1.0 increase it.
    *
    * @range -10.0 to 10.0
    * @default 1.0
    */
   saturation?: number | string;
   /**
    * Sets the brightness adjustment level.
    * Accepts an expression; positive values increase brightness, negative values decrease it.
    *
    * @range -10.0 to 10.0
    * @default 0
    */
   brightness?: number | string;
}

export interface HueBuilder {
   (options: HueOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface ColorBalanceOptions {
   /**
    * Adjusts the red balance in the shadows (darkest pixels).
    * Positive values enhance red; negative values shift toward cyan.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   redShadows?: number;
   /**
    * Adjusts the green balance in the shadows (darkest pixels).
    * Positive values enhance green; negative values shift toward magenta.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   greenShadows?: number;
   /**
    * Adjusts the blue balance in the shadows (darkest pixels).
    * Positive values enhance blue; negative values shift toward yellow.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   blueShadows?: number;
   /**
    * Adjusts the red balance in the midtones (medium brightness pixels).
    * Positive values enhance red; negative values shift toward cyan.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   redMidtones?: number;
   /**
    * Adjusts the green balance in the midtones (medium brightness pixels).
    * Positive values enhance green; negative values shift toward magenta.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   greenMidtones?: number;
   /**
    * Adjusts the blue balance in the midtones (medium brightness pixels).
    * Positive values enhance blue; negative values shift toward yellow.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   blueMidtones?: number;
   /**
    * Adjusts the red balance in the highlights (brightest pixels).
    * Positive values enhance red; negative values shift toward cyan.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   redHighlights?: number;
   /**
    * Adjusts the green balance in the highlights (brightest pixels).
    * Positive values enhance green; negative values shift toward magenta.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   greenHighlights?: number;
   /**
    * Adjusts the blue balance in the highlights (brightest pixels).
    * Positive values enhance blue; negative values shift toward yellow.
    *
    * @range -1.0 to 1.0
    * @default 0.0
    */
   blueHighlights?: number;
   /**
    * Preserves overall lightness when adjusting color balance.
    * When enabled, color shifts are applied without altering perceived brightness.
    *
    * @range 0 (disabled), 1 (enabled)
    * @default 0
    */
   preserveLightness?: boolean;
}

export interface ColorBalanceBuilder {
   (options: ColorBalanceOptions): RequiredFilterOutput<'videoFilter'>;
}

export type PreserveColorModeValues = 'none' | 'lum' | 'max' | 'avg' | 'sum' | 'nrm' | 'pwr';

export interface ColorChannelMixerOptions {
   /**
    * Adjusts the contribution of the input red channel to the output red channel.
    *
    * @range -2.0 to 2.0
    * @default 1.0
    */
   redInRed?: number;
   /**
    * Adjusts the contribution of the input red channel to the output green channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   redInGreen?: number;
   /**
    * Adjusts the contribution of the input red channel to the output blue channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   redInBlue?: number;
   /**
    * Adjusts the contribution of the input red channel to the output alpha channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   redInAlpha?: number;
   /**
    * Adjusts the contribution of the input green channel to the output red channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   greenInRed?: number;
   /**
    * Adjusts the contribution of the input green channel to the output green channel.
    *
    * @range -2.0 to 2.0
    * @default 1.0
    */
   greenInGreen?: number;
   /**
    * Adjusts the contribution of the input green channel to the output blue channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   greenInBlue?: number;
   /**
    * Adjusts the contribution of the input green channel to the output alpha channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   greenInAlpha?: number;
   /**
    * Adjusts the contribution of the input blue channel to the output red channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   blueInRed?: number;
   /**
    * Adjusts the contribution of the input blue channel to the output green channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   blueInGreen?: number;
   /**
    * Adjusts the contribution of the input blue channel to the output blue channel.
    *
    * @range -2.0 to 2.0
    * @default 1.0
    */
   blueInBlue?: number;
   /**
    * Adjusts the contribution of the input blue channel to the output alpha channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   blueInAlpha?: number;
   /**
    * Adjusts the contribution of the input alpha channel to the output red channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   alphaInRed?: number;
   /**
    * Adjusts the contribution of the input alpha channel to the output green channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   alphaInGreen?: number;
   /**
    * Adjusts the contribution of the input alpha channel to the output blue channel.
    *
    * @range -2.0 to 2.0
    * @default 0.0
    */
   alphaInBlue?: number;
   /**
    * Adjusts the contribution of the input alpha channel to the output alpha channel.
    *
    * @range -2.0 to 2.0
    * @default 1.0
    */
   alphaInAlpha?: number;
   /**
    * Sets the preserve color mode, controlling how color values are retained during processing.
    *
    * - **'none'**: Disables color preservation. (default)
    * - **'lum'**: Preserves luminance.
    * - **'max'**: Preserves the maximum RGB component.
    * - **'avg'**: Preserves the average of RGB components.
    * - **'sum'**: Preserves the sum of RGB components.
    * - **'nrm'**: Preserves the normalized value of RGB components.
    * - **'pwr'**: Preserves the power value of RGB components.
    *
    * @range 'none' | 'lum' | 'max' | 'avg' | 'sum' | 'nrm' | 'pwr'
    * @default 'none'
    */
   preserveColorMode?: PreserveColorModeValues;
   /**
    * Sets the amount of color preservation when altering colors.
    * Higher values retain more of the original color characteristics.
    *
    * @range 0.0 to 1.0
    * @default 0.0
    */
   preserveColorAmount?: number;
}

export interface ColorChannelMixerBuilder {
   (options: ColorChannelMixerOptions): RequiredFilterOutput<'videoFilter'>;
}

export type ColorPresetValues = (typeof ColorPresets)[number];

export interface LookUpTableBuilder {
   (preset: ColorPresetValues): RequiredFilterOutput<'videoFilter'>;
}

export interface ColorMultiplierOptions {
   /**
    * Red component transformation expression for RGB input.
    * Accepts either a numeric multiplier (e.g. `1.2`) or a full expression string.
    *
    * - If a number is provided, it multiplies the red channel: `1.2` → `1.2 * r`
    * - If a string is provided, it must be a valid FFmpeg expression.
    *
    * Available constants: `w`, `h`, `val`, `clipval`, `minval`, `maxval`, `negval`
    * Available functions: `clip(val)`, `gammaval(gamma)`
    *
    * Only applies with the `lutrgb` filter (requires RGB input).
    *
    * @range For numbers: 0.0 to 10.0 (recommended). For strings: any valid expression.
    * @default clipval
    */
   red?: number | string;
   /**
    * Green component transformation expression for RGB input.
    * Accepts either a numeric multiplier (e.g. `1.2`) or a full expression string.
    *
    * - If a number is provided, it multiplies the green channel: `1.2` → `1.2 * g`
    * - If a string is provided, it must be a valid FFmpeg expression.
    *
    * Available constants: `w`, `h`, `val`, `clipval`, `minval`, `maxval`, `negval`
    * Available functions: `clip(val)`, `gammaval(gamma)`
    *
    * Only applies with the `lutrgb` filter (requires RGB input).
    *
    * @range For numbers: 0.0 to 10.0 (recommended). For strings: any valid expression.
    * @default clipval
    */
   green?: number | string;
   /**
    * Blue component transformation expression for RGB input.
    * Accepts either a numeric multiplier (e.g. `1.2`) or a full expression string.
    *
    * - If a number is provided, it multiplies the blue channel: `1.2` → `1.2 * b`
    * - If a string is provided, it must be a valid FFmpeg expression.
    *
    * Available constants: `w`, `h`, `val`, `clipval`, `minval`, `maxval`, `negval`
    * Available functions: `clip(val)`, `gammaval(gamma)`
    *
    * Only applies with the `lutrgb` filter (requires RGB input).
    *
    * @range For numbers: 0.0 to 10.0 (recommended). For strings: any valid expression.
    * @default clipval
    */
   blue?: number | string;
   /**
    * Alpha component transformation expression for RGB input.
    * Accepts either a numeric multiplier (e.g. `1.2`) or a full expression string.
    *
    * - If a number is provided, it multiplies the alpha channel: `1.2` → `1.2 * a`
    * - If a string is provided, it must be a valid FFmpeg expression.
    *
    * Available constants: `w`, `h`, `val`, `clipval`, `minval`, `maxval`, `negval`
    * Available functions: `clip(val)`, `gammaval(gamma)`
    *
    * Only applies with the `lutrgb` filter (requires RGB input).
    *
    * @range For numbers: 0.0 to 10.0 (recommended). For strings: any valid expression.
    * @default clipval
    */
   alpha?: number | string;
}

export interface ColorMultiplierBuilder {
   (options: ColorMultiplierOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface DeshakeOptions {
   /**
    * X coordinate of the top-left corner of the motion vector search area.
    * Set to -1 to use the full frame.
    * @range -1 to frame width
    * @default -1
    */
   x?: number;
   /**
    * Y coordinate of the top-left corner of the motion vector search area.
    * Set to -1 to use the full frame.
    * @range -1 to frame height
    * @default -1
    */
   y?: number;
   /**
    * Width of the motion vector search area.
    * Set to -1 to use the full frame width.
    * @range -1 to frame width
    * @default -1
    */
   width?: number;
   /**
    * Height of the motion vector search area.
    * Set to -1 to use the full frame height.
    * @range -1 to frame height
    * @default -1
    */
   height?: number;
   /**
    * Maximum horizontal motion search range in pixels.
    * Limits how far the algorithm will search for horizontal shifts.
    * @range 0 to 64
    * @default 16
    */
   rangeX?: number;
   /**
    * Maximum vertical motion search range in pixels.
    * Limits how far the algorithm will search for vertical shifts.
    * @range 0 to 64
    * @default 16
    */
   rangeY?: number;
   /**
    * Method used to fill blank areas at the edge of the frame after stabilization.
    * - **'blank'** (0): Fill with black pixels.
    * - **'original'** (1): Use pixels from the original unstable frame.
    * - **'clamp'** (2): Extend edge pixels.
    * - **'mirror'** (3): Mirror edge pixels.
    * @range 0 (blank), 1 (original), 2 (clamp), 3 (mirror)
    * @default 3 (mirror)
    */
   edge?: 'blank' | 'clamp' | 'mirror' | 'original' | 0 | 1 | 2 | 3;
   /**
    * Block size in pixels used for motion estimation.
    * Affects accuracy and performance: smaller blocks increase precision but are slower.
    * @range 4 to 128
    * @default 8
    */
   blocksize?: number;
   /**
    * Contrast threshold for block analysis.
    * Only blocks with contrast above this value are considered for motion estimation.
    * @range 1 to 255
    * @default 125
    */
   contrast?: number;
}

export interface DeshakeBuilder {
   (options?: DeshakeOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface PanOptions {
   /**
    * Sets the audio channel layout.
    *
    * @range 'mono' | 'stereo' | '5.1' | '7.1'
    * @default 'stereo'
    */
   layout: 'mono' | 'stereo' | '5.1' | '7.1';
   /**
    * Defines how audio channels are mapped and mixed.
    * Each element of the array can either be a number (representing the gain for each channel in order, starting with channel c0 at index 0),
    * or a mathematical expression in the form: `"out_name=[gain*]in_name[(+-)[gain*]in_name...]"`, with:
    *
    * - `out_name`: The output channel (e.g., 'FL', 'FR', 'c0', 'c1').
    * - `gain`: An optional multiplier to adjust the volume of the input channel (default is 1).
    * - `in_name`: The input channel to use for the mapping (e.g., 'c0', 'c1').
    *
    * If you use `<` instead of `=`, the gains will be automatically normalized to avoid clipping.
    *
    * @example
    * [0.5, 1] // Maps `c0` with 0.5 gain and `c1` with 1 gain.
    * ["FL=c0", "FR=c1+0.5c2"] // Maps `c0` to `FL`, and mixes `c1` with `0.5` gain and `c2` to `FR`.
    */
   channels: (number | string)[];
}

export interface PanBuilder {
   (options: PanOptions): RequiredFilterOutput<'audioFilter'>;
}

export type TextAlign =
   | 'left+top'
   | 'left+middle'
   | 'left+bottom'
   | 'center+top'
   | 'center+middle'
   | 'center+bottom'
   | 'right+top'
   | 'right+middle'
   | 'right+bottom';

export interface DrawTextOptions {
   /**
    * Sets the text to be drawn on the video.
    *
    * @example
    * 'Hello, World!'
    */
   text: string;
   /**
    * Sets the horizontal and vertical alignment of the text within its bounding box.
    * Combines one horizontal ('left', 'center', 'right') and one vertical ('top', 'middle', 'bottom') alignment.
    *
    * Note: Tab characters (`\t`) are only supported when horizontal alignment is set to `'left'`.
    *
    * @default 'left+top'
    */
   textAlign?: TextAlign;
   /**
    * Sets the spacing in pixels between lines of text.
    * Useful for multi-line text rendering.
    * @range 0 and up
    * @default 0
    */
   lineSpacing?: number;
   /**
    * Path to the font file used for rendering the text.
    * @default undefined
    */
   fontFile?: string;
   /**
    * Font size in pixels used to render the text.
    * @range Any positive number
    * @default 16
    */
   fontSize?: number | string;
   /**
    * Color used to render the text.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default "black"
    */
   fontColor?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Horizontal position (in pixels or expression) where the text will be drawn.
    * Can be a number or an expression using frame properties and functions (e.g., `main_w-text_w-10` to align right with 10px padding).
    *
    * Available constants:
    * `main_w`, `text_w`, `n`, `t`, `rand(min,max)`, `dar`, `sar`, etc.
    * See FFmpeg drawtext docs for full list.
    *
    * @default "0"
    * @example "main_w - text_w - 10"
    */
   x?: number | string;
   /**
    * Vertical position (in pixels or expression) where the text will be drawn.
    * Can be a number or an expression using frame properties and functions (e.g., `main_h-text_h-10` to align bottom with 10px padding).
    *
    * Available constants:
    * `main_h`, `text_h`, `n`, `t`, `rand(min,max)`, `dar`, `sar`, etc.
    * See FFmpeg drawtext docs for full list.
    *
    * @default "0"
    * @example "main_h - text_h - 10"
    */
   y?: number | string;
   /**
    * Width of the border (in pixels) drawn around the text.
    * The border uses the `bordercolor` value.
    * @range 0 and up
    * @default 0
    */
   borderWidth?: number;
   /**
    * Color used to draw the border around the text.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default "black"
    */
   borderColor?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Horizontal offset (in pixels) for the text shadow position relative to the text position.
    * Can be a positive or negative value.
    * @range Any integer value
    * @default 0
    */
   shadowX?: number;
   /**
    * Vertical offset (in pixels) for the text shadow position relative to the text position.
    * Can be a positive or negative value.
    * @range Any integer value
    * @default 0
    */
   shadowY?: number;
   /**
    * Color used to draw a shadow behind the text.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default "black"
    */
   shadowColor?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Enables or disables drawing a box around the text using the background color.
    * Set to 1 to enable or 0 to disable.
    * @default 0
    * @range 0, 1
    */
   box?: boolean | 0 | 1;
   /**
    * Color used to draw the box around the text.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default "white"
    */
   boxColor?: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Sets the width of the border around the box using the `boxcolor`.
    * Can be specified in different formats for individual sides of the box:
    * - `boxborderw=10` sets all borders to 10px.
    * - `boxborderw=10|20` sets top/bottom borders to 10px, left/right to 20px.
    * - `boxborderw=10|20|30` sets top to 10px, bottom to 30px, and left/right to 20px.
    * - `boxborderw=10|20|30|40` sets top to 10px, right to 20px, bottom to 30px, and left to 40px.
    *
    * @default "0"
    */
   boxBorderWidth?: number;
   /**
    * Enables or disables the drawing of the text based on the provided expression or value.
    * The value can be a number or an expression. If the value evaluates to a non-zero number, the text will be drawn; otherwise, it will be disabled.
    *
    * @default 1 (enabled)
    */
   enable?: string | number | boolean;
}

export interface DrawTextBuilder {
   (options: DrawTextOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface DrawBoxOptions {
   /**
    * Number or expression to set the x-coordinate (horizontal position) of the top-left corner of the box.
    * Supports variables like `in_w`, `in_h`, `dar`, `sar`, `x`, `y`, etc.
    * @default 0
    * @example
    * `x=in_w/4`
    */
   x: number | string;
   /**
    * Number or expression to set the y-coordinate (vertical position) of the top-left corner of the box.
    * Supports variables like `in_w`, `in_h`, `dar`, `sar`, `x`, `y`, etc.
    * @default 0
    * @example
    * `y=x/dar`
    */
   y: number | string;
   /**
    * Number or expression to set the width of the box.
    * Use `0` to match the input width.
    * Supports variables like `in_w`, `in_h`, `dar`, `w`, `h`, etc.
    * @default 0
    */
   width: number | string;
   /**
    * Number or expression to set the height of the box.
    * Use `0` to match the input height.
    * Supports variables like `in_w`, `in_h`, `dar`, `w`, `h`, etc.
    * @default 0
    */
   height: number | string;
   /**
    * Specifies the color of the box.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default black
    */
   fillColor: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Specifies the color of the border.
    * Accepts any valid FFmpeg color string (e.g., "white", "red", "#RRGGBB", "0xRRGGBBAA").
    * @default gray
    */
   borderColor: (typeof FFmpegColor)[number] | (string & {});
   /**
    * Sets the thickness of the box edge.
    * Supports expressions with variables like `in_w`, `in_h`, `dar`, `t`, etc.
    * @default 3
    */
   thickness?: number;
   /**
    * Enables or disables the drawing of the text based on the provided expression or value.
    * The value can be a number or an expression. If the value evaluates to a non-zero number, the text will be drawn; otherwise, it will be disabled.
    * @default 1 (enabled)
    */
   enable?: string | number | boolean;
}

export interface DrawBoxBuilder {
   (options: DrawBoxOptions): RequiredFilterOutput<'videoFilter'>;
}
