import { ColorChannelMixerBuilder } from '@/types/filters';
import { buildParam } from '@/lib/common';
import { NoParametersError } from '@/lib/errors';

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
   if (redInRed !== undefined) params.push(buildParam('rr', redInRed));
   if (redInGreen !== undefined) params.push(buildParam('rg', redInGreen));
   if (redInBlue !== undefined) params.push(buildParam('rb', redInBlue));
   if (redInAlpha !== undefined) params.push(buildParam('ra', redInAlpha));
   if (greenInRed !== undefined) params.push(buildParam('gr', greenInRed));
   if (greenInGreen !== undefined) params.push(buildParam('gg', greenInGreen));
   if (greenInBlue !== undefined) params.push(buildParam('gb', greenInBlue));
   if (greenInAlpha !== undefined) params.push(buildParam('ga', greenInAlpha));
   if (blueInRed !== undefined) params.push(buildParam('br', blueInRed));
   if (blueInGreen !== undefined) params.push(buildParam('bg', blueInGreen));
   if (blueInBlue !== undefined) params.push(buildParam('bb', blueInBlue));
   if (blueInAlpha !== undefined) params.push(buildParam('ba', blueInAlpha));
   if (alphaInRed !== undefined) params.push(buildParam('ar', alphaInRed));
   if (alphaInGreen !== undefined) params.push(buildParam('ag', alphaInGreen));
   if (alphaInBlue !== undefined) params.push(buildParam('ab', alphaInBlue));
   if (alphaInAlpha !== undefined) params.push(buildParam('aa', alphaInAlpha));
   if (preserveColorMode !== undefined) params.push(buildParam('pc', preserveColorMode));
   if (preserveColorAmount !== undefined) params.push(buildParam('pa', preserveColorAmount));

   if (!params.length) {
      throw new NoParametersError('colorchannelmixer');
   }

   return { videoFilter: `colorchannelmixer=${params.join(':')}` };
};
