import { DenoiseBuilder } from '@/types/filters';

export const DenoiseFilter: DenoiseBuilder = (method) => {
   if (method === 'hqdn3d') return { videoFilter: 'hqdn3d=4:3:6:4.5', audioFilter: '' };
   if (method === 'atadenoise') return { videoFilter: 'atadenoise=0.5', audioFilter: '' };
   if (method === 'nlmeans') return { videoFilter: 'nlmeans=s=7:p=9:pc=5', audioFilter: '' };
   return { audioFilter: 'afftdn=nt=w:tn=1', videoFilter: '' };
};
