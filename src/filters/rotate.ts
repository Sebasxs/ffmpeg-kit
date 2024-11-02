import { RotateBuilder } from '@/types/filters';
import { buildParam, colorHasAlpha } from '@/lib/common';

export const RotateFilter: RotateBuilder = (options) => {
   const { degrees, expression, outputWidth, outputHeight, emptyAreaColor } = options;
   const angle = expression ? expression : `${degrees}*PI/180`;

   let videoFilter = colorHasAlpha(emptyAreaColor) ? `format=yuva420p,` : '';
   videoFilter = `rotate='${angle}':c='${emptyAreaColor}'`;

   const defaultOH = `roth(${angle})`;
   const defaultOW = `rotw(${angle})`;
   videoFilter += `:${buildParam('ow', outputWidth || defaultOW)}`;
   videoFilter += `:${buildParam('oh', outputHeight || defaultOH)}`;
   videoFilter += `,pad=w=ceil(iw/2)*2:h=ceil(ih/2)*2:x=(ow-iw)/2:y=(oh-ih)/2:color=${emptyAreaColor}`;

   return { videoFilter };
};
