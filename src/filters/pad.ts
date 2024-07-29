import { PadBuilder } from '@/types/filters';
import { buildParam } from '@/utils/common';

export const PadFilter: PadBuilder = (options) => {
   const { width, height, x, y, color } = options;
   const params = [];

   params.push(buildParam('w', width));
   params.push(buildParam('h', height));
   params.push(buildParam('x', x ?? '(ow-iw)/2'));
   params.push(buildParam('y', y ?? '(oh-ih)/2'));
   params.push(buildParam('color', color ?? 'black'));

   const videoFilter = `pad=${params.join(':')}`;
   return { videoFilter };
};
