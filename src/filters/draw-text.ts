import { DrawTextBuilder } from '@/types/filters';
import { buildParam } from '@/utils/common';

export const DrawTextFilter: DrawTextBuilder = (options) => {
   const {
      text,
      fontFile,
      fontSize,
      fontColor,
      x,
      y,
      borderWidth,
      borderColor,
      shadowX,
      shadowY,
      shadowColor,
      box,
      boxColor,
      boxBorderWidth,
      textAlign,
      lineSpacing,
      enable,
   } = options;

   let videoFilter = `drawtext=text=${text}`;
   const params = [];
   if (fontFile !== undefined) params.push(`fontfile='${fontFile}'`);
   if (fontSize !== undefined) params.push(buildParam('fontsize', fontSize));
   if (fontColor !== undefined) params.push(buildParam('fontcolor', fontColor));
   if (x !== undefined) params.push(buildParam('x', x));
   if (y !== undefined) params.push(buildParam('y', y));
   if (borderWidth !== undefined) params.push(buildParam('borderw', borderWidth));
   if (borderColor !== undefined) params.push(buildParam('bordercolor', borderColor));
   if (shadowX !== undefined) params.push(buildParam('shadowx', shadowX));
   if (shadowY !== undefined) params.push(buildParam('shadowy', shadowY));
   if (shadowColor !== undefined) params.push(buildParam('shadowcolor', shadowColor));
   if (box !== undefined) params.push(buildParam('box', Number(box)));
   if (boxColor !== undefined) params.push(buildParam('boxcolor', boxColor));
   if (boxBorderWidth !== undefined) params.push(buildParam('boxborderw', boxBorderWidth));
   if (textAlign !== undefined) params.push(buildParam('textalign', textAlign));
   if (lineSpacing !== undefined) params.push(buildParam('linespacing', lineSpacing));
   if (enable !== undefined) {
      if (typeof enable === 'string') params.push(buildParam('enable', enable));
      else params.push(buildParam('enable', Number(enable)));
   }

   if (params.length) videoFilter += `:${params.join(':')}`;
   return { videoFilter };
};
