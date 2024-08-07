import { FlipBuilder } from '@/types/filters';

export const FlipFilter: FlipBuilder = (axis) => {
   if (axis === 'horizontal') return { videoFilter: 'hflip' };
   if (axis === 'vertical') return { videoFilter: 'vflip' };
   return { videoFilter: 'hflip,vflip' };
};
