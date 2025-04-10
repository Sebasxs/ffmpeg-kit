import { FFmpegColor, AspectRatios, Curves, ColorPresets } from '@/utils/constants.ts';

type AtLeastOne<T, K extends keyof T = keyof T> = {
   [P in K]-?: Required<Pick<T, P>> & Partial<Omit<T, P>>;
}[K];

interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

export type StreamConstraint = 'audio' | 'video' | 'all';

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
   average: number;
   /**
    * Sets the target loudness range (LRA) in LU (Loudness Units).
    *
    * This defines the allowed dynamic range of the output signal. The filter will attempt to
    * compress or expand the dynamics to match this target range while preserving overall balance.
    *
    * @range 1.0 to 50.0
    * @default 9.0
    */
   range: number;
   /**
    * Sets the maximum allowed true peak level in dBTP (decibels True Peak).
    *
    * This limits the highest peak that the signal can reach after normalization, helping to prevent
    * digital clipping during playback or encoding.
    *
    * @range -9.0 to 0.0
    * @default -1.0
    */
   peak: number;
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
   (options: Omit<TrimOptions, 'stream'>): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
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
   curve?: (typeof Curves)[number] | (string & {});
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
   width: string | number;
   /**
    * Sets the output video height.
    * Evaluated once during filter initialization or when updated via command.
    *
    * @range Any positive integer or expression (e.g., "ih/2")
    * @default ih
    */
   height: string | number;
   /**
    * Horizontal position of the left edge of the output within the input.
    * Evaluated per frame.
    *
    * @range Any integer or expression (e.g., "(in_w-out_w)/2")
    * @default (in_w-out_w)/2
    */
   x: string | number;
   /**
    * Vertical position of the top edge of the output within the input.
    * Evaluated per frame.
    *
    * @range Any integer or expression (e.g., "(in_h-out_h)/2")
    * @default (in_h-out_h)/2
    */
   y: string | number;
   /**
    * Sets the aspect ratio of the output video.
    * If set, the filter will adjust the output dimensions to match the specified aspect ratio.
    *
    * @example
    * '16:9' // sets the aspect ratio to 16:9
    * '4:3' // sets the aspect ratio to 4:3
    */
   aspectRatio: (typeof AspectRatios)[number] | (string & {});
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

export type BrightnessOptions = AtLeastOne<{
   brightness?: number | string;
   contrast?: number | string;
   saturation?: number | string;
   gamma?: number | string;
}>;

export interface BrightnessBuilder {
   (options: BrightnessOptions): RequiredFilterOutput<'videoFilter'>;
}

export type HueOptions =
   | {
        degrees: number;
        expression?: never;
        saturation?: number | string;
        brightness?: number | string;
     }
   | {
        degrees?: never;
        expression: string;
        saturation?: number | string;
        brightness?: number | string;
     };

export interface HueBuilder {
   (options: HueOptions): RequiredFilterOutput<'videoFilter'>;
}

export type ColorBalanceOptions = { preserveLightness?: boolean } & AtLeastOne<{
   redShadows?: number;
   greenShadows?: number;
   blueShadows?: number;
   redMidtones?: number;
   greenMidtones?: number;
   blueMidtones?: number;
   redHighlights?: number;
   greenHighlights?: number;
   blueHighlights?: number;
}>;

export interface ColorBalanceBuilder {
   (options: ColorBalanceOptions): RequiredFilterOutput<'videoFilter'>;
}

export type PreserveColorModeValues = 'none' | 'lum' | 'max' | 'avg' | 'sum' | 'nrm' | 'pwr';

export type ColorChannelMixerOptions = {
   preserveColorMode?: PreserveColorModeValues;
   preserveColorAmount?: number;
} & AtLeastOne<{
   redInRed?: number;
   redInGreen?: number;
   redInBlue?: number;
   redInAlpha?: number;
   greenInRed?: number;
   greenInGreen?: number;
   greenInBlue?: number;
   greenInAlpha?: number;
   blueInRed?: number;
   blueInGreen?: number;
   blueInBlue?: number;
   blueInAlpha?: number;
   alphaInRed?: number;
   alphaInGreen?: number;
   alphaInBlue?: number;
   alphaInAlpha?: number;
}>;

export interface ColorChannelMixerBuilder {
   (options: ColorChannelMixerOptions): RequiredFilterOutput<'videoFilter'>;
}

export type ColorPresetValues = (typeof ColorPresets)[number];

export interface LookUpTableBuilder {
   (preset: ColorPresetValues): RequiredFilterOutput<'videoFilter'>;
}

export type ColorMultiplierOptions = AtLeastOne<{
   red?: number;
   green?: number;
   blue?: number;
   alpha?: number;
}>;

export interface ColorMultiplierBuilder {
   (options: ColorMultiplierOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface DeshakeOptions {
   x?: number;
   y?: number;
   width?: number;
   height?: number;
   rangeX?: number;
   rangeY?: number;
   edge?: 'blank' | 'clamp' | 'mirror' | 'smear';
   blocksize?: number;
   contrast?: number;
}

export interface DeshakeBuilder {
   (options?: DeshakeOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface PanOptions {
   layout: 'mono' | 'stereo' | '5.1' | '7.1';
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
   text: string;
   textAlign?: TextAlign;
   lineSpacing?: number;
   fontFile?: string;
   fontSize?: number | string;
   fontColor?: (typeof FFmpegColor)[number] | (string & {});
   x?: number | string;
   y?: number | string;
   borderWidth?: number;
   borderColor?: (typeof FFmpegColor)[number] | (string & {});
   shadowX?: number;
   shadowY?: number;
   shadowColor?: (typeof FFmpegColor)[number] | (string & {});
   box?: boolean;
   boxColor?: (typeof FFmpegColor)[number] | (string & {});
   boxBorderWidth?: number;
   enable?: string | number | boolean;
}

export interface DrawTextBuilder {
   (options: DrawTextOptions): RequiredFilterOutput<'videoFilter'>;
}

export type DrawBoxOptions = {
   x: number | string;
   y: number | string;
   width: number | string;
   height: number | string;
   enable?: string | number | boolean;
} & (
   | {
        fillColor: (typeof FFmpegColor)[number] | (string & {});
        borderColor?: (typeof FFmpegColor)[number] | (string & {});
        thickness?: never;
     }
   | {
        borderColor: (typeof FFmpegColor)[number] | (string & {});
        thickness?: number;
        fillColor?: (typeof FFmpegColor)[number] | (string & {});
     }
);

export interface DrawBoxBuilder {
   (options: DrawBoxOptions): RequiredFilterOutput<'videoFilter'>;
}

//    subtitles
//    alphamerge
//    overlay
//    blend
//    stack

export interface OverlayOptions {
   x: string | number;
   y: string | number;
   enable?: string | number | boolean;
}
