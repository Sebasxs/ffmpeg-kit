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
   I: number;
   LRA: number;
   TP: number;
   linear?: boolean;
}

export interface LoudnormBuilder {
   (options: LoudnormOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface DynaudnormOptions {
   f?: number;
   g?: number;
   p?: number;
   m?: boolean;
   r?: boolean;
   s?: boolean;
   t?: number;
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
   curve?:
      | 'tri'
      | 'qsin'
      | 'hsin'
      | 'esin'
      | 'log'
      | 'ipar'
      | 'qua'
      | 'cub'
      | 'squ'
      | 'cbr'
      | 'par'
      | 'exp'
      | 'iqsin'
      | 'ihsin'
      | 'dese'
      | 'desi';
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
        aspectRatio:
           | '1:1'
           | '1:2'
           | '2:1'
           | '2:3'
           | '3:2'
           | '3:4'
           | '4:3'
           | '4:5'
           | '5:4'
           | '9:16'
           | '9:21'
           | '9:32'
           | '10:16'
           | '16:9'
           | '16:10'
           | '21:9'
           | '32:9'
           | (string & {});
     };

export interface CropBuilder {
   (
      options: CropOptions,
      inputWidth?: number,
      inputHeight?: number,
   ): RequiredFilterOutput<'videoFilter'>;
}

export interface OverlayOptions {
   x: string | number;
   y: string | number;
   enable?: string | number | boolean;
}

// export interface MediaFilters {
//    speed?: number;
//    reverse?: boolean;
//    denoise?: boolean;
//    blur?: number;
//    correction?: {}; // contrast, brightness, saturation
//    color?: {}; // color balance with lut filter (lookup table)
//    flip?: {};
//    alpha?: number;
//    scale?: {};
//    rotate?: number;
//    pad?: {};
//    delay?: number;
//    negate?: boolean;
//    grayscale?: boolean;
//    drawtext?: {};
//    drawbox?: {};
//    stabilize?: boolean;
//    overlay?: OverlayOptions;
// }

// subtitles?: {};
