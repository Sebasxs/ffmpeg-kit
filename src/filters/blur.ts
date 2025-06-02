import { BlurBuilder } from '../types/filters.js';

export const BlurFilter: BlurBuilder = (radius) => {
   return {
      videoFilter: `gblur=sigma=${radius}`,
   };
};
