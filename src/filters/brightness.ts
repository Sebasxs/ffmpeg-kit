import { BrightnessBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const BrightnessFilter: BrightnessBuilder = (options) => {
   const { brightness, contrast, saturation, gamma } = options;

   const params = [];
   if (brightness !== undefined) params.push(buildParam('brightness', brightness));
   if (contrast !== undefined) params.push(buildParam('contrast', contrast));
   if (saturation !== undefined) params.push(buildParam('saturation', saturation));
   if (gamma !== undefined) params.push(buildParam('gamma', gamma));

   return { videoFilter: 'eq=' + params.join(':') };
};
