import { FadeBuilder } from '@/types/filters';

export const FadeFilter: FadeBuilder = (options) => {
   const { type = 'in', start = 0, duration, curve, color } = options;
   const fadeCurve = curve ? `:curve=${curve}` : '';
   const audioFilter = `afade=t=${type}:st=${start}:d=${duration}${fadeCurve}`;
   let videoFilter = `format=yuva420p,fade=t=${type}:st=${start}:d=${duration}`;

   if (color !== undefined) videoFilter += `:c=${color}`;
   else videoFilter += ':alpha=1';

   return { audioFilter, videoFilter };
};
