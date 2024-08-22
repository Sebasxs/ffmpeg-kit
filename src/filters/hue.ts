import { HueBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const HueFilter: HueBuilder = (options) => {
   const { degrees, expression, saturation, brightness } = options;
   const angle = expression ? `H='${expression}'` : `h='${degrees}*PI/180'`;

   let videoFilter = `hue=${angle}`;
   const params = [];
   if (saturation !== undefined) params.push(buildParam('s', saturation));
   if (brightness !== undefined) params.push(buildParam('b', brightness));
   if (params.length) videoFilter += `:${params.join(':')}`;

   return { videoFilter };
};
