import { PadBuilder } from '@/types/filters';

export const PadFilter: PadBuilder = (options) => {
   const { width, height, x = '(ow-iw)/2', y = '(oh-ih)/2', color = 'black' } = options;

   const videoFilter = `pad=${width}:${height}:${x}:${y}:${color}`;
   return { videoFilter };
};
