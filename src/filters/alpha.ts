import { AlphaBuilder } from '@/types/filters';

export const AlphaFilter: AlphaBuilder = (value) => {
   const alpha = value * 255;
   const videoFilter = `format=yuva420p,lut=a=${alpha}`;

   return { videoFilter };
};
