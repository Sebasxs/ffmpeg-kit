import { FFmpegColor } from '@/utils/colors.ts';
import { aspectRatios } from '@/utils/aspect-ratios.ts';
import { curves } from '@/utils/curves.ts';

type AtLeastOne<T, K extends keyof T = keyof T> = {
   [P in K]-?: Required<Pick<T, P>> & Partial<Omit<T, P>>;
}[K];

interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

export type StreamConstraint = 'audio' | 'video' | 'all';

type RequiredFilterOutput<T extends keyof FilterOuput> = Required<Pick<FilterOutput, T>>;

export interface VolumeBuilder {
   (value: number | string): RequiredFilterOutput<'audioFilter'>;
}

export interface LoudnormOptions {
   average: number;
   range: number;
   peak: number;
   linear?: boolean;
}

export interface LoudnormBuilder {
   (options: LoudnormOptions): RequiredFilterOutput<'audioFilter'>;
}

export type DynaudnormOptions = AtLeastOne<{
   frameLength?: number;
   gaussSize?: number;
   peak?: number;
   maxGain?: number;
   rms?: number;
   compress?: number;
   threshold?: number;
}>;

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
   curve?: (typeof curves)[number] | (string & {});
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
        aspectRatio: (typeof aspectRatios)[number] | (string & {});
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

// export interface MediaFilters {
//    color?: {}; // color balance with lut filter (lookup table)
//    drawtext?: {};
//    drawbox?: {};
//    stabilize?: boolean;
// }

//    subtitles?: {};
//    alphamerge?:
//    blend?: {};

export interface OverlayOptions {
   x: string | number;
   y: string | number;
   enable?: string | number | boolean;
}
