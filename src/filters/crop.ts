import { CropBuilder } from '@/types/filters';

export const CropFilter: CropBuilder = (options, mediaWidth, mediaHeight) => {
   const { width, height, x, y, aspectRatio } = options;
   const xCoord = x !== undefined ? `:x=${x}` : '';
   const yCoord = y !== undefined ? `:y=${y}` : '';
   const coords = xCoord + yCoord;

   if (!aspectRatio) {
      return { videoFilter: `crop=w=${width}:h=${height}${coords}` };
   }

   const [aspectWidth, aspectHeight] = aspectRatio.split(':').map(Number);
   const targetRatio = aspectWidth / aspectHeight;
   const inverseRatio = 1 / targetRatio;

   if (!mediaWidth || !mediaHeight) {
      if (targetRatio >= 1) {
         return { videoFilter: `crop=w=min(ih\,iw)*${targetRatio}:h=min(ih\,iw)${coords}` };
      }

      return { videoFilter: `crop=w=min(ih\,iw):h=min(ih\,iw)*${inverseRatio}${coords}` };
   }

   const mediaRatio = mediaWidth / mediaHeight;
   if (mediaRatio >= targetRatio) {
      return { videoFilter: `crop=w=ih*${targetRatio}:h=ih${coords}` };
   }

   return { videoFilter: `crop=w=iw:h=iw*${inverseRatio}${coords}` };
};
