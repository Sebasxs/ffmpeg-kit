import { CropBuilder } from '@/types/filters';

export const CropFilter: CropBuilder = (options, mediaWidth, mediaHeight) => {
   const { width, height, x, y, aspectRatio } = options;
   if (!aspectRatio) {
      let videoFilter = `crop=${width}:${height}`;
      if (x !== undefined && y !== undefined) {
         videoFilter += `:${x}:${y}`;
      }

      return { videoFilter };
   }

   const [aspectWidth, aspectHeight] = aspectRatio.split(':').map(Number);
   const targetRatio = aspectWidth / aspectHeight;
   const inverseRatio = 1 / targetRatio;

   if (!mediaWidth || !mediaHeight) {
      if (targetRatio >= 1) return { videoFilter: `crop=min(ih\,iw)*${targetRatio}:min(ih\,iw)` };
      return { videoFilter: `crop=min(ih\,iw):min(ih\,iw)*${inverseRatio}` };
   }

   const mediaRatio = mediaWidth / mediaHeight;
   if (mediaRatio >= targetRatio) return { videoFilter: `crop=ih*${targetRatio}:ih` };
   return { videoFilter: `crop=iw:iw*${inverseRatio}` };
};
