interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

export type StreamConstraint = 'onlyAudio' | 'onlyVideo' | 'both';

type RequiredFilterOutput<T extends keyof FilterOuput> = Required<Pick<FilterOutput, T>>;

export interface VolumeBuilder {
   (value: number): RequiredFilterOutput<'audioFilter'>;
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

export type PitchOptions = {
   pitch: number;
   tempo?: number;
   formant?: boolean;
};

export interface PitchBuilder {
   (options: PitchOptions): RequiredFilterOutput<'audioFilter'>;
}

export type TrimOptions = { stream?: StreamConstraint } & (
   | { start: string | number; end?: never; duration?: never }
   | { end: string | number; start?: string | number; duration: never }
   | { duration: string | number; start?: string | number; end?: never }
);

export interface TrimBuilder {
   (options: TrimOptions): RequiredFilterOutput<'audioFilter' | 'videoFilter'>;
}
