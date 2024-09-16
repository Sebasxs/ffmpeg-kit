import { DeshakeBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';

export const DeshakeFilter: DeshakeBuilder = (options) => {
   const { x, y, width, height, motionRangeX, motionRangeY, edge, blocksize, contrast } =
      options || {};
   let videoFilter = 'deshake';

   const params = [];
   if (x !== undefined) params.push(`x=${x}`);
   if (y !== undefined) params.push(`y=${y}`);
   if (width !== undefined) params.push(`w=${width}`);
   if (height !== undefined) params.push(`h=${height}`);
   if (motionRangeX !== undefined) params.push(`rx=${motionRangeX}`);
   if (motionRangeY !== undefined) params.push(`ry=${motionRangeY}`);
   if (edge !== undefined) params.push(`edge=${edge}`);
   if (blocksize !== undefined) params.push(buildParam('blocksize', blocksize));
   if (contrast !== undefined) params.push(`contrast=${contrast}`);

   if (params.length) videoFilter += '=' + params.join(':');
   return { videoFilter };
};
