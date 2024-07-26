import { DrawTextBuilder } from '@/types/filters';

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
   if (fontSize !== undefined) params.push(`fontsize=${fontSize}`);
   if (fontColor !== undefined) {
      if (/[a-z]+/.test(fontColor)) params.push(`fontcolor=${fontColor}`);
      else params.push(`fontcolor='${fontColor}'`);
   }
   if (x !== undefined) {
      if (typeof x === 'number') params.push(`x=${x}`);
      else params.push(`x='${x}'`);
   }
   if (y !== undefined) {
      if (typeof y === 'number') params.push(`y=${y}`);
      else params.push(`y='${y}'`);
   }
   if (borderWidth !== undefined) params.push(`borderw=${borderWidth}`);
   if (borderColor !== undefined) {
      if (/[a-z]+/.test(borderColor)) params.push(`bordercolor=${borderColor}`);
      else params.push(`bordercolor='${borderColor}'`);
   }
   if (shadowX !== undefined) params.push(`shadowx=${shadowX}`);
   if (shadowY !== undefined) params.push(`shadowy=${shadowY}`);
   if (shadowColor !== undefined) {
      if (/[a-z]+/.test(shadowColor)) params.push(`shadowcolor=${shadowColor}`);
      else params.push(`shadowcolor='${shadowColor}'`);
   }
   if (box !== undefined) params.push(`box=${box}`);
   if (boxColor !== undefined) {
      if (/[a-z]+/.test(boxColor)) params.push(`boxcolor=${boxColor}`);
      else params.push(`boxcolor='${boxColor}'`);
   }
   if (boxBorderWidth !== undefined) params.push(`boxborderw=${boxBorderWidth}`);
   if (textAlign !== undefined) params.push(`textalign=${textAlign}`);
   if (lineSpacing !== undefined) params.push(`linespacing=${lineSpacing}`);
   if (enable !== undefined) {
      if (['number', 'boolean'].includes(typeof enable)) params.push(`enable=${Number(enable)}`);
      else params.push(`enable='${enable}'`);
   }

   if (params.length) videoFilter += `:${params.join(':')}`;
   return { videoFilter };
};
