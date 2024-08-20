import { ColorChannelMixerBuilder } from '@/types/filters';
import { buildParam } from '@/utils/common';
import { NoParametersError } from '@/utils/errors';

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
   if (redInGreen !== undefined) params.push(buildParam('gr', redInGreen));
   if (redInBlue !== undefined) params.push(buildParam('br', redInBlue));
   if (redInAlpha !== undefined) params.push(buildParam('ar', redInAlpha));
   if (greenInRed !== undefined) params.push(buildParam('rg', greenInRed));
   if (greenInGreen !== undefined) params.push(buildParam('gg', greenInGreen));
   if (greenInBlue !== undefined) params.push(buildParam('bg', greenInBlue));
   if (greenInAlpha !== undefined) params.push(buildParam('ag', greenInAlpha));
   if (blueInRed !== undefined) params.push(buildParam('rb', blueInRed));
   if (blueInGreen !== undefined) params.push(buildParam('gb', blueInGreen));
   if (blueInBlue !== undefined) params.push(buildParam('bb', blueInBlue));
   if (blueInAlpha !== undefined) params.push(buildParam('ab', blueInAlpha));
   if (alphaInRed !== undefined) params.push(buildParam('ra', alphaInRed));
   if (alphaInGreen !== undefined) params.push(buildParam('ga', alphaInGreen));
   if (alphaInBlue !== undefined) params.push(buildParam('ba', alphaInBlue));
   if (alphaInAlpha !== undefined) params.push(buildParam('aa', alphaInAlpha));
   if (preserveColorMode !== undefined) params.push(buildParam('pc', preserveColorMode));
   if (preserveColorAmount !== undefined) params.push(buildParam('pa', preserveColorAmount));

   if (!params.length) {
      throw new NoParametersError('colorchannelmixer');
   }

   return { videoFilter: `colorchannelmixer=${params.join(':')}` };
};
