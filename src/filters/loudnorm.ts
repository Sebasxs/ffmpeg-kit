import { LoudnormBuilder } from '@/types/filters';

export const LoudnormFilter: LoudnormBuilder = (options) => {
   const { average, range, peak, linear } = options;
   let normalizeString = `loudnorm=I=${average}:LRA=${range}:TP=${peak}`;

   if (linear) {
      normalizeString += `:linear=${linear}`;
   }

   return {
      audioFilter: normalizeString,
   };
};
