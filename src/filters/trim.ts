import { TrimBuilder } from '@/types/filters';

export const TrimFilter: TrimBuilder = (options) => {
   const { start, end, duration } = options;
   const filter = { audioFilter: 'atrim=', videoFilter: 'trim=' };

   const filterParams = [];
   if (start !== undefined) filterParams.push(`start=${start}`);
   if (end !== undefined) filterParams.push(`end=${end}`);
   if (duration !== undefined) filterParams.push(`duration=${duration}`);

   const params = filterParams.join(':');
   filter.audioFilter += params + ',asetpts=PTS-STARTPTS';
   filter.videoFilter += params + ',setpts=PTS-STARTPTS';

   return filter;
};
