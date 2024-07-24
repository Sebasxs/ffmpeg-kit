import { PanBuilder } from '@/types/filters';

export const PanFilter: PanBuilder = (options) => {
   const { layout, channels } = options;

   let audioFilter = `pan=${layout}`;
   channels.forEach((channel, index) => {
      const simpleValue = typeof channel === 'number' || channel.match(/^c\d+$/);
      if (simpleValue) {
         audioFilter += `|c${index}=${channel}`;
         return;
      }

      audioFilter += `|c${index}='${channel}'`;
   });

   return { audioFilter };
};
