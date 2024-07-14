import { DelayBuilder } from '@/types/filters';

export const DelayFilter: DelayBuilder = (seconds: number) => {
   return {
      audioFilter: `asetpts=PTS+${seconds}/TB`,
      videoFilter: `setpts=PTS+${seconds}/TB`,
   };
};
