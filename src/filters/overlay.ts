import { OverlayBuilder } from '../types/filters.js';
import { buildParam } from '../lib/common.js';

export const OverlayFilter: OverlayBuilder = (options) => {
   const { x = 0, y = 0, enable, eofAction, shortest } = options;
   const params: string[] = [];

   if (x !== undefined) params.push(buildParam('x', x));
   if (y !== undefined) params.push(buildParam('y', y));
   if (eofAction !== undefined) params.push(buildParam('eof_action', eofAction));
   if (shortest !== undefined) params.push(buildParam('shortest', Number(shortest)));
   if (enable !== undefined) {
      if (typeof enable === 'string') params.push(buildParam('enable', enable));
      else params.push(buildParam('enable', Number(enable)));
   }

   const videoFilter = params.length ? `overlay=${params.join(':')}` : 'overlay';
   return { videoFilter };
};
