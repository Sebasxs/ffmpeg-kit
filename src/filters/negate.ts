import { NegateBuilder } from '@/types/filters';

export const NegateFilter: NegateBuilder = (options) => {
   const { red, green, blue } = options;
   const params = [];

   if (red === true) params.push('r=negval');
   if (green === true) params.push('g=negval');
   if (blue === true) params.push('b=negval');

   if (!params.length) return { videoFilter: 'negate' };

   return {
      videoFilter: `lutrgb=${params.join(':')}`,
   };
};
