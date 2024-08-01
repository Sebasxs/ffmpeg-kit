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
   volume: number | string;
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

export type TrimOptions = { stream?: StreamConstraint } & (
   | { start: string | number; end?: never; duration?: never }
   | { end: string | number; start?: string | number; duration: never }
   | { duration: string | number; start?: string | number; end?: never }
);

export interface TrimBuilder {
   (options: Omit<TrimOptions, 'stream'>): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface FadeOptions {
   type: 'in' | 'out';
   duration: number;
   start?: number;
   curve?: (typeof Curves)[number] | (string & {});
   stream?: StreamConstraint;
}

export interface FadeBuilder {
   (options: Omit<FadeOptions, 'stream'>): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export type CropOptions =
   | {
        width: string | number;
        height: string | number;
        x?: never;
        y?: never;
        aspectRatio?: never;
     }
   | {
        width: string | number;
        height: string | number;
        x: string | number;
        y: string | number;
        aspectRatio?: never;
     }
   | {
        width?: never;
        height?: never;
        x?: never;
        y?: never;
        aspectRatio: (typeof AspectRatios)[number] | (string & {});
     };

export interface CropBuilder {
   (
      options: CropOptions,
      inputWidth?: number,
      inputHeight?: number,
   ): RequiredFilterOutput<'videoFilter'>;
}

export type ScaleOptions = {
   flags?: 'bilinear' | 'bicubic' | 'lanczos' | 'gaussian';
   forceAspectRatio?: 'decrease' | 'increase' | 'disable';
} & (
   | { width: number | string; height?: number | string; percentage?: never }
   | { width?: number | string; height: number | string; percentage?: never }
   | { percentage: number; width?: never; height?: never }
);

export interface ScaleBuilder {
   (options: ScaleOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface SpeedBuilder {
   (factor: number): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}

export interface ReverseOptions {
   stream?: StreamConstraint;
}

export interface ReverseBuilder {
   (options?: ReverseOptions): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
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

export type RotateOptions =
   | {
        degrees: number;
        expression?: never;
        outputWidth?: number | string;
        outputHeight?: number | string;
        pivotX?: number | string;
        pivotY?: number | string;
        emptyAreaColor?: (typeof FFmpegColor)[number] | (string & {});
     }
   | {
        degrees?: never;
        expression: string;
        outputWidth?: number | string;
        outputHeight?: number | string;
        pivotX?: number | string;
        pivotY?: number | string;
        emptyAreaColor?: (typeof FFmpegColor)[number] | (string & {});
     };

export interface RotateBuilder {
   (options: RotateOptions): RequiredFilterOutput<'videoFilter'>;
}

export interface AlphaBuilder {
   (value: number): RequiredFilterOutput<'videoFilter'>;
}

export interface PadOptions {
   width: number | string;
   height: number | string;
   color?: (typeof FFmpegColor)[number] | (string & {});
   x?: number | string;
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
