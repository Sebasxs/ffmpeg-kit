import { NegateBuilder } from '@/types/filters';

export const NegateFilter: NegateBuilder = (alpha) => {
   return {
      videoFilter: `negate=${alpha ? 1 : 0}`,
   };
};
