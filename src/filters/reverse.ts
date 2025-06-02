import { ReverseBuilder } from '../types/filters.js';

export const ReverseFilter: ReverseBuilder = () => {
   return {
      videoFilter: 'reverse',
      audioFilter: 'areverse',
   };
};
