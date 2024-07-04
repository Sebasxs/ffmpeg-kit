import { FlipBuilder } from '@/types/filters';

export const FlipFilter: FlipBuilder = (mode) => {
   if (mode === 'horizontal') return { videoFilter: 'hflip' };
   if (mode === 'vertical') return { videoFilter: 'vflip' };
   return { videoFilter: 'hflip,vflip' };
};
