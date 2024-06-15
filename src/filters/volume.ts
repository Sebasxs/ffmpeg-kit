import { VolumeBuilder } from '@/types/filters';

export const BuildVolumeFilter: VolumeBuilder = (options) => {
   const { volume, precision } = options;
   let volumeString = `volume=${volume}`;

   if (precision) {
      volumeString += `:precision=${precision}`;
   }

   return {
      audioFilter: volumeString,
   };
};
