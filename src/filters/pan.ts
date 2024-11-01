import { PanBuilder } from '@/types/filters';

const numChannelsByLayout = {
   mono: 1,
   stereo: 2,
   '5.1': 6,
   '7.1': 8,
};

export const PanFilter: PanBuilder = (options) => {
   const { layout, channels } = options;

   let audioFilter = `pan=${layout}`;
   channels.forEach((channel, index) => {
      if (numChannelsByLayout[layout] < index + 1) return;

      const isNumber = typeof channel === 'number';
      if (isNumber) {
         audioFilter += `|c${index}='${channel}*c${index}'`;
         return;
      }

      audioFilter += `|c${index}='${channel}'`;
   });

   return { audioFilter };
};
