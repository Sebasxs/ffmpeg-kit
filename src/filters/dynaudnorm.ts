import { DynaudnormBuilder } from '@/types/filters';

export const DynaudnormFilter: DynaudnormBuilder = (options) => {
   const { f = 1, g, p, m = true, r, s, t } = options;
   let normalizeString = 'dynaudnorm=';

   const filterParams: string[] = [];
   if (f !== undefined) filterParams.push(`f=${f}`);
   if (g !== undefined) filterParams.push(`g=${g}`);
   if (p !== undefined) filterParams.push(`p=${p}`);
   if (m !== undefined) filterParams.push(`m=${m}`);
   if (r !== undefined) filterParams.push(`r=${r}`);
   if (s !== undefined) filterParams.push(`s=${s}`);
   if (t !== undefined) filterParams.push(`t=${t}`);

   normalizeString += filterParams.join(':');

   return {
      audioFilter: normalizeString,
   };
};
