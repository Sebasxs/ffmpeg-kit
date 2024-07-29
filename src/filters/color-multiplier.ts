import { ColorMultiplierBuilder } from '@/types/filters';
import { buildParam } from '@/utils/common';

export const ColorMultiplierFilter: ColorMultiplierBuilder = (options) => {
   const { red, green, blue, alpha } = options;

   const params = [];
   if (red !== undefined) params.push(buildParam('r', `${red}*r`));
   if (green !== undefined) params.push(buildParam('g', `${green}*g`));
   if (blue !== undefined) params.push(buildParam('b', `${blue}*b`));
   if (alpha !== undefined) params.push(buildParam('a', `${alpha}*a`));

   let videoFilter = `lutrgb=${params.join(':')}`;
   if (alpha !== undefined) videoFilter = 'format=rgba,' + videoFilter;

   return { videoFilter };
};
