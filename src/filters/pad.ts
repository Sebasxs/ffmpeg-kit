import { PadBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const PadFilter: PadBuilder = (options) => {
   const { width, height, x, y, color } = options;
   const params = [];

   if (width !== undefined) params.push(buildParam('w', width));
   if (height !== undefined) params.push(buildParam('h', height));
   if (x !== undefined) params.push(buildParam('x', x));
   if (y !== undefined) params.push(buildParam('y', y));
   if (color !== undefined) params.push(buildParam('color', color));

   const videoFilter = `pad=${params.join(':')}`;
   return { videoFilter };
};
