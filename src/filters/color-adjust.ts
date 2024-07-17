import { ColorAdjustmentBuilder } from '@/types/filters';

export const ColorAdjustmentFilter: ColorAdjustmentBuilder = (options) => {
   const { brightness, contrast, saturation, gamma } = options;

   const params = [];
   if (brightness !== undefined) params.push(`brightness='${brightness}'`);
   if (contrast !== undefined) params.push(`contrast='${contrast}'`);
   if (saturation !== undefined) params.push(`saturation='${saturation}'`);
   if (gamma !== undefined) params.push(`gamma='${gamma}'`);

   return { videoFilter: 'eq=' + params.join(':') };
};
