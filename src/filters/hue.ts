import { HueBuilder } from '../types/filters.js';
import { buildParam } from '../lib/common.js';

export const HueFilter: HueBuilder = (options) => {
   const { degrees, expression, saturation, brightness } = options;
   const angle = expression ? `H='${expression}'` : `h=${degrees}`;

   let videoFilter = `hue=${angle}`;
   const params = [];
   if (saturation !== undefined) params.push(buildParam('s', saturation));
   if (brightness !== undefined) params.push(buildParam('b', brightness));
   if (params.length) videoFilter += `:${params.join(':')}`;

   return { videoFilter };
};
