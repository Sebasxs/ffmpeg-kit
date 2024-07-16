import { GrayscaleBuilder } from '@/types/filters';

export const GrayscaleFilter: GrayscaleBuilder = () => {
   return {
      videoFilter: 'format=gray',
   };
};
