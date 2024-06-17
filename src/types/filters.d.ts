interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

type RequiredFilterOutput<T extends keyof FilterOuput> = Required<Pick<FilterOutput, T>>;

export interface VolumeOptions {
   volume: string | number;
   precision?: 'fixed' | 'float' | 'double';
}

export interface VolumeBuilder {
   (options: VolumeOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface NormalizeOptions {
   I: number;
   LRA: number;
   TP: number;
   linear?: boolean;
}

export interface NormalizeBuilder {
   (options: NormalizeOptions): RequiredFilterOutput<'audioFilter'>;
}
