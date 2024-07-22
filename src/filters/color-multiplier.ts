import { ColorMultiplierBuilder } from '@/types/filters';

export const ColorMultiplierFilter: ColorMultiplierBuilder = (options) => {
   const { red, green, blue, alpha } = options;

   const params = [];
   if (red !== undefined) params.push(`r=${red}*r`);
   if (green !== undefined) params.push(`g=${green}*g`);
   if (blue !== undefined) params.push(`b=${blue}*b`);
   if (alpha !== undefined) params.push(`a=${alpha}*a`);

   let videoFilter = `lutrgb=${params.join(':')}`;
   if (alpha !== undefined) videoFilter = 'format=rgba,' + videoFilter;

   return { videoFilter };
};
