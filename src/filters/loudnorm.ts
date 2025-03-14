import { LoudnormBuilder } from '@/types/filters';

export const LoudnormFilter: LoudnormBuilder = (options) => {
   const { I, LRA, TP, linear } = options;
   let normalizeString = `loudnorm=I=${I}:LRA=${LRA}:TP=${TP}`;

   if (linear) {
      normalizeString += `:linear=${linear}`;
   }

   return {
      audioFilter: normalizeString,
   };
};
