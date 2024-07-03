import { BlurBuilder } from '@/types/filters';

export const BlurFilter: BlurBuilder = (radius) => {
   return {
      videoFilter: `gblur=sigma=${radius}`,
   };
};
