import { FadeBuilder } from '@/types/filters';

export const FadeFilter: FadeBuilder = (options) => {
   const { type, start = 0, duration, curve } = options;
   const fadeCurve = curve ? `:curve=${curve}` : '';

   return {
      audioFilter: `afade=t=${type}:st=${start}:d=${duration}${fadeCurve}`,
      videoFilter: `fade=t=${type}:st=${start}:d=${duration}:alpha=1`,
   };
};
