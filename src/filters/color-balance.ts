import { ColorBalanceBuilder } from '@/types/filters';

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
   if (redShadows !== undefined) params.push(`rs=${redShadows}`);
   if (greenShadows !== undefined) params.push(`gs=${greenShadows}`);
   if (blueShadows !== undefined) params.push(`bs=${blueShadows}`);
   if (redMidtones !== undefined) params.push(`rm=${redMidtones}`);
   if (greenMidtones !== undefined) params.push(`gm=${greenMidtones}`);
   if (blueMidtones !== undefined) params.push(`bm=${blueMidtones}`);
   if (redHighlights !== undefined) params.push(`rh=${redHighlights}`);
   if (greenHighlights !== undefined) params.push(`gh=${greenHighlights}`);
   if (blueHighlights !== undefined) params.push(`bh=${blueHighlights}`);
   if (preserveLightness !== undefined) params.push(`pl=${preserveLightness}`);

   return {
      videoFilter: `colorbalance=${params.join(':')}`,
   };
};
