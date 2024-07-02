import { ReverseBuilder } from '@/types/filters';

export const ReverseFilter: ReverseBuilder = () => {
   return {
      videoFilter: 'reverse',
      audioFilter: 'areverse',
   };
};
