import { HueBuilder } from '@/types/filters';

export const HueFilter: HueBuilder = (options) => {
   const { degrees, expression, saturation, brightness } = options;
   const angle = expression ? `H='${expression}'` : `h='${degrees}*PI/180'`;

   let videoFilter = `hue=${angle}`;
   if (saturation !== undefined) videoFilter += `:s='${saturation}'`;
   if (brightness !== undefined) videoFilter += `:b='${brightness}'`;

   return { videoFilter };
};
