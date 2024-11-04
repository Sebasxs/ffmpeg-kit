import { ScaleBuilder } from '@/types/filters';

export const ScaleFilter: ScaleBuilder = (options) => {
   const { width, height, size, percentage, forceAspectRatio, flags } = options;

   const normalizedWidth = typeof width === 'number' ? Math.ceil(width / 2) * 2 : width;
   const normalizedHeight = typeof height === 'number' ? Math.ceil(height / 2) * 2 : height;

   let videoFilter = 'scale';

   if (percentage) {
      videoFilter += `=ceil(iw*${percentage / 200})*2:ceil(ih*${percentage / 200})*2`;
   } else if (width && height) {
      videoFilter += `=${normalizedWidth}:${normalizedHeight}`;
   } else if (width) {
      videoFilter += `=${normalizedWidth}:-2`;
   } else {
      videoFilter += `=-2:${normalizedHeight}`;
   }

   if (forceAspectRatio && forceAspectRatio !== 'disable' && !percentage) {
      videoFilter += `:force_original_aspect_ratio=${forceAspectRatio}:force_divisible_by=2`;
   }

   if (size) videoFilter = `scale=${size}`;

   if (flags) {
      videoFilter += `:flags=${flags}`;
   }

   return { videoFilter };
};
