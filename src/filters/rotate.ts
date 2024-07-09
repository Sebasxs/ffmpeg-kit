import { RotateBuilder } from '@/types/filters';

export const RotateFilter: RotateBuilder = (options) => {
   const {
      degrees,
      expression,
      outputWidth,
      outputHeight,
      pivotX,
      pivotY,
      emptyAreaColor = 'black@0',
   } = options;

   const angle = expression ? expression : `${degrees}*PI/180`;
   let videoFilter = `format=yuva420p,rotate='${angle}':c='${emptyAreaColor}'`;

   const defaultOH = `rotw(${angle})`;
   const defaultOW = `roth(${angle})`;
   videoFilter += `:ow='${outputWidth || defaultOW}'`;
   videoFilter += `:oh='${outputHeight || defaultOH}'`;

   if (pivotX) videoFilter += `:cx='${pivotX}'`;
   if (pivotY) videoFilter += `:cy='${pivotY}'`;

   return { videoFilter };
};
