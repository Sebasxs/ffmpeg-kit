import { TrimBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const TrimFilter: TrimBuilder = (options) => {
   const { start, end, duration } = options;
   const filter = { audioFilter: 'atrim=', videoFilter: 'trim=' };

   const filterParams = [];
   if (start !== undefined) filterParams.push(buildParam('start', start));
   if (end !== undefined) filterParams.push(buildParam('end', end));
   else if (duration !== undefined) filterParams.push(buildParam('duration', duration));

   const params = filterParams.join(',');
   filter.audioFilter += params + ',asetpts=PTS-STARTPTS';
   filter.videoFilter += params + ',setpts=PTS-STARTPTS';

   return filter;
};
