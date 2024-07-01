import { SpeedBuilder } from '@/types/filters';

export const SpeedFilter: SpeedBuilder = (factor) => {
   let audioFilter = '';
   const videoFilter = `setpts=PTS/${factor}`;

   if (factor >= 0.5 && factor <= 2) {
      audioFilter = `atempo=${factor}`;
   } else if (factor > 2) {
      let temp = factor;

      while (temp > 2) {
         audioFilter += `atempo=2,`;
         temp /= 2;
      }

      temp = Math.round(temp * 100) / 100;
      audioFilter += `atempo=${temp}`;
   } else if (factor < 0.5) {
      let temp = factor;

      while (temp < 0.5) {
         audioFilter += `atempo=0.5,`;
         temp *= 2;
      }

      temp = Math.round(temp * 50) / 100;
      audioFilter += `atempo=${temp}`;
   }

   return { audioFilter, videoFilter };
};
