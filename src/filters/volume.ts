import { VolumeBuilder } from '@/types/filters';

export const VolumeFilter: VolumeBuilder = ({ volume, _eval = 'once' }) => {
   if (typeof volume === 'number') return { audioFilter: `volume=${Math.abs(volume)}` };
   return { audioFilter: `volume='${volume}':eval=${_eval}` };
};
