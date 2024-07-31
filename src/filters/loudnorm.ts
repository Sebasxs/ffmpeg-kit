import { LoudnormBuilder } from '@/types/filters';

export const LoudnormFilter: LoudnormBuilder = (options) => {
   const { average, range, peak } = options;
   return { audioFilter: `loudnorm=I=${average}:LRA=${range}:TP=${peak}` };
};
