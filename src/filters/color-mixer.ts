import { ColorChannelMixerBuilder } from '@/types/filters';

export const ColorChannelMixerFilter: ColorChannelMixerBuilder = (options) => {
   const {
      preserveColorMode,
      preserveColorAmount,
      redInRed,
      redInGreen,
      redInBlue,
      redInAlpha,
      greenInRed,
      greenInGreen,
      greenInBlue,
      greenInAlpha,
      blueInRed,
      blueInGreen,
      blueInBlue,
      blueInAlpha,
      alphaInRed,
      alphaInGreen,
      alphaInBlue,
      alphaInAlpha,
   } = options;

   const params = [];
   if (redInRed !== undefined) params.push(`rr=${redInRed}`);
   if (redInGreen !== undefined) params.push(`gr=${redInGreen}`);
   if (redInBlue !== undefined) params.push(`br=${redInBlue}`);
   if (redInAlpha !== undefined) params.push(`ar=${redInAlpha}`);
   if (greenInRed !== undefined) params.push(`rg=${greenInRed}`);
   if (greenInGreen !== undefined) params.push(`gg=${greenInGreen}`);
   if (greenInBlue !== undefined) params.push(`bg=${greenInBlue}`);
   if (greenInAlpha !== undefined) params.push(`ag=${greenInAlpha}`);
   if (blueInRed !== undefined) params.push(`rb=${blueInRed}`);
   if (blueInGreen !== undefined) params.push(`gb=${blueInGreen}`);
   if (blueInBlue !== undefined) params.push(`bb=${blueInBlue}`);
   if (blueInAlpha !== undefined) params.push(`ab=${blueInAlpha}`);
   if (alphaInRed !== undefined) params.push(`ra=${alphaInRed}`);
   if (alphaInGreen !== undefined) params.push(`ga=${alphaInGreen}`);
   if (alphaInBlue !== undefined) params.push(`ba=${alphaInBlue}`);
   if (alphaInAlpha !== undefined) params.push(`aa=${alphaInAlpha}`);
   if (preserveColorMode !== undefined) params.push(`pc=${preserveColorMode}`);
   if (preserveColorAmount !== undefined) params.push(`pa=${preserveColorAmount}`);

   return { videoFilter: `colorchannelmixer=${params.join(':')}` };
};
