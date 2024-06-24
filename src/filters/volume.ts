import { VolumeBuilder } from '@/types/filters';

export const VolumeFilter: VolumeBuilder = (value) => {
   return {
      audioFilter: `volume='${value}'`,
   };
};
