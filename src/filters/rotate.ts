import { RotateBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const RotateFilter: RotateBuilder = (options) => {
   const { degrees, expression, outputWidth, outputHeight, emptyAreaColor } = options;

   const angle = expression ? expression : `${degrees}*PI/180`;
   let videoFilter = `format=yuva420p,rotate='${angle}':c='${emptyAreaColor}'`;

   const defaultOH = `rotw(${angle})`;
   const defaultOW = `roth(${angle})`;
   videoFilter += `:${buildParam('ow', outputWidth || defaultOW)}`;
   videoFilter += `:${buildParam('oh', outputHeight || defaultOH)}`;

   return { videoFilter };
};
