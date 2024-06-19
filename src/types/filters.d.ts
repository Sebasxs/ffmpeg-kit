interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

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
