import { PitchBuilder } from '@/types/filters';

export const PitchFilter: PitchBuilder = (options) => {
   const { pitch, tempo, formant } = options;
   let pitchString = `pitch=pitch=${pitch}`;

   if (tempo) {
      pitchString += `:tempo=${tempo}`;
   }
   if (formant) {
      pitchString += `:formant=${formant}`;
   }

   return {
      audioFilter: pitchString,
   };
};
