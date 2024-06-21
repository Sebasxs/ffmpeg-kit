import { PitchBuilder } from '@/types/filters';

export const PitchFilter: PitchBuilder = (factor, sampleRate) => {
   return {
      audioFilter: `asetrate=${sampleRate}*${factor},aresample=${sampleRate},atempo=${1 / factor}`,
   };
};
