import { LoudnormBuilder } from '@/types/filters';

export const LoudnormFilter: LoudnormBuilder = (options) => {
   const { average, range, peak, linear } = options;
   let normalizeString = `loudnorm=I=${average}:LRA=${range}:TP=${peak}`;

   if (linear !== undefined) {
      normalizeString += `:linear=${Number(linear)}`;
   }

   return {
      audioFilter: normalizeString,
   };
};
