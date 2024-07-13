import { AlphaBuilder } from '@/types/filters';

export const AlphaFilter: AlphaBuilder = (alpha) => {
   const videoFilter = `format=rgba,colorchannelmixer=aa=${alpha}`;
   return { videoFilter };
};
