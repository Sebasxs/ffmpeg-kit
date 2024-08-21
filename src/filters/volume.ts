import { VolumeBuilder } from '@/types/filters';

export const VolumeFilter: VolumeBuilder = ({ volume, _eval = 'once' }) => {
   if (typeof volume === 'number') return { audioFilter: `volume=${Math.abs(volume)}` };

   const isdBValue = /-?\d+(\.\d+)?dB$/.test(volume);
   if (isdBValue) return { audioFilter: `volume=${volume}` };

   const isPercentageValue = /-?\d+(\.\d+)?%$/.test(volume);
   if (isPercentageValue) return { audioFilter: `volume=${volume}` };

   let audioFilter = `volume=${volume}`;
   if (_eval) audioFilter += `:eval=${_eval}`;
   return { audioFilter };
};
