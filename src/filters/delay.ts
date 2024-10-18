import { DelayBuilder } from '@/types/filters';

export const DelayFilter: DelayBuilder = (seconds: number) => {
   return {
      audioFilter: `adelay=delays=${seconds}s:all=1`,
      videoFilter: `tpad=start_duration=${seconds}:color=0x00000000`,
   };
};
