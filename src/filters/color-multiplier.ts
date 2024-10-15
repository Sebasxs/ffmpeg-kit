import { ColorMultiplierBuilder } from '@/types/filters';
import { NoParametersError } from '@/lib/errors';

export const ColorMultiplierFilter: ColorMultiplierBuilder = (options) => {
   const { red, green, blue, alpha } = options;

   const params = [];
   if (red !== undefined) {
      if (typeof red === 'number') params.push(`r='${red}*val'`);
      else params.push(`r='${red}'`);
   }
   if (green !== undefined) {
      if (typeof green === 'number') params.push(`g='${green}*val'`);
      else params.push(`g='${green}'`);
   }
   if (blue !== undefined) {
      if (typeof blue === 'number') params.push(`b='${blue}*val'`);
      else params.push(`b='${blue}'`);
   }
   if (alpha !== undefined) {
      if (typeof alpha === 'number') params.push(`a='${alpha}*val'`);
      else params.push(`a='${alpha}'`);
   }

   let videoFilter = `lutrgb=${params.join(':')}`;
   if (alpha !== undefined) videoFilter = 'format=rgba,' + videoFilter;

   if (!params.length) throw new NoParametersError('lutrgb');
   return { videoFilter };
};
