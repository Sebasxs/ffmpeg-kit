import { VolumeBuilder } from '@/types/filters';

export const VolumeFilter: VolumeBuilder = (value) => {
   if (typeof value === 'number') return { audioFilter: `volume=${value}` };
   return { audioFilter: `volume='${value}'` };
};
