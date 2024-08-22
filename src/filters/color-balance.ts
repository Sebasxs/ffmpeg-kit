import { ColorBalanceBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';
import { NoParametersError } from '@/lib/errors';

export const ColorBalanceFilter: ColorBalanceBuilder = (options) => {
   const {
      redShadows,
      greenShadows,
      blueShadows,
      redMidtones,
      greenMidtones,
      blueMidtones,
      redHighlights,
      greenHighlights,
      blueHighlights,
      preserveLightness,
   } = options;

   const params = [];
   if (redShadows !== undefined) params.push(buildParam('rs', redShadows));
   if (greenShadows !== undefined) params.push(buildParam('gs', greenShadows));
   if (blueShadows !== undefined) params.push(buildParam('bs', blueShadows));
   if (redMidtones !== undefined) params.push(buildParam('rm', redMidtones));
   if (greenMidtones !== undefined) params.push(buildParam('gm', greenMidtones));
   if (blueMidtones !== undefined) params.push(buildParam('bm', blueMidtones));
   if (redHighlights !== undefined) params.push(buildParam('rh', redHighlights));
   if (greenHighlights !== undefined) params.push(buildParam('gh', greenHighlights));
   if (blueHighlights !== undefined) params.push(buildParam('bh', blueHighlights));
   if (preserveLightness !== undefined) params.push(buildParam('pl', Number(preserveLightness)));

   if (!params.length) {
      throw new NoParametersError('colorbalance');
   }

   return {
      videoFilter: `colorbalance=${params.join(':')}`,
   };
};
