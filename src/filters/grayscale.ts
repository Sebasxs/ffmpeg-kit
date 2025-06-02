import { GrayscaleBuilder } from '../types/filters.js';

export const GrayscaleFilter: GrayscaleBuilder = () => {
   return {
      videoFilter: 'format=gray',
   };
};
