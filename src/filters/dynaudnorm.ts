import { DynaudnormBuilder } from '@/types/filters';

export const DynaudnormFilter: DynaudnormBuilder = (options) => {
   const { frameLength, gaussSize, peak, maxGain, rms, compress, threshold } = options;
   let normalizeString = 'dynaudnorm=';

   const filterParams: string[] = [];
   if (frameLength !== undefined) filterParams.push(`f=${frameLength}`);
   if (gaussSize !== undefined) filterParams.push(`g=${gaussSize}`);
   if (peak !== undefined) filterParams.push(`p=${peak}`);
   if (maxGain !== undefined) filterParams.push(`m=${maxGain}`);
   if (rms !== undefined) filterParams.push(`r=${rms}`);
   if (compress !== undefined) filterParams.push(`s=${compress}`);
   if (threshold !== undefined) filterParams.push(`t=${threshold}`);

   normalizeString += filterParams.join(':');

   return {
      audioFilter: normalizeString,
   };
};
