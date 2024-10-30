import { RemoveColorBuilder } from '@/types/filters';

export const RemoveColorFilter: RemoveColorBuilder = (options) => {
   const { red, green, blue } = options;
   const params = [];

   if (red === true) params.push('r=0');
   if (green === true) params.push('g=0');
   if (blue === true) params.push('b=0');

   return {
      videoFilter: `lutrgb=${params.join(':')}`,
   };
};
