import { SpeedBuilder } from '@/types/filters';

export const SpeedFilter: SpeedBuilder = (factor) => {
   return {
      audioFilter: `atempo=${factor}`,
      videoFilter: `setpts=PTS/${factor}`,
   };
};
