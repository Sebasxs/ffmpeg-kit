interface FilterOutput {
   audioFilter?: string;
   videoFilter?: string;
}

type RequiredFilterOutput<T extends keyof FilterOuput> = Required<Pick<FilterOutput, T>>;

export interface VolumeBuilder {
   (options: VolumeOptions): RequiredFilterOutput<'audioFilter'>;
}

export interface VolumeOptions {
   volume: string | number;
   precision?: 'fixed' | 'float' | 'double';
}
