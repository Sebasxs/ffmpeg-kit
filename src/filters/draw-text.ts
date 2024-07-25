import { DrawTextBuilder } from '@/types/filters';

export const DrawTextFilter: DrawTextBuilder = (options) => {
   const {
      text,
      fontfile,
      fontsize,
      fontcolor,
      x,
      y,
      borderw,
      bordercolor,
      shadowX,
      shadowY,
      shadowColor,
      box,
      boxcolor,
      boxborderw,
      textAlign,
      lineSpacing,
      enable,
   } = options;

   let videoFilter = `drawtext=text=${text}`;
   const params = [];
   if (fontfile !== undefined) params.push(`fontfile='${fontfile}'`);
   if (fontsize !== undefined) params.push(`fontsize=${fontsize}`);
   if (fontcolor !== undefined) {
      if (/[a-z]+/.test(fontcolor)) params.push(`fontcolor=${fontcolor}`);
      else params.push(`fontcolor='${fontcolor}'`);
   }
   if (x !== undefined) {
      if (typeof x === 'number') params.push(`x=${x}`);
      else params.push(`x='${x}'`);
   }
   if (y !== undefined) {
      if (typeof y === 'number') params.push(`y=${y}`);
      else params.push(`y='${y}'`);
   }
   if (borderw !== undefined) params.push(`borderw=${borderw}`);
   if (bordercolor !== undefined) {
      if (/[a-z]+/.test(bordercolor)) params.push(`bordercolor=${bordercolor}`);
      else params.push(`bordercolor='${bordercolor}'`);
   }
   if (shadowX !== undefined) params.push(`shadowx=${shadowX}`);
   if (shadowY !== undefined) params.push(`shadowy=${shadowY}`);
   if (shadowColor !== undefined) {
      if (/[a-z]+/.test(shadowColor)) params.push(`shadowcolor=${shadowColor}`);
      else params.push(`shadowcolor='${shadowColor}'`);
   }
   if (box !== undefined) params.push(`box=${box}`);
   if (boxcolor !== undefined) {
      if (/[a-z]+/.test(boxcolor)) params.push(`boxcolor=${boxcolor}`);
      else params.push(`boxcolor='${boxcolor}'`);
   }
   if (boxborderw !== undefined) params.push(`boxborderw=${boxborderw}`);
   if (textAlign !== undefined) params.push(`textalign=${textAlign}`);
   if (lineSpacing !== undefined) params.push(`linespacing=${lineSpacing}`);
   if (enable !== undefined) {
      if (['number', 'boolean'].includes(typeof enable)) params.push(`enable=${Number(enable)}`);
      else params.push(`enable='${enable}'`);
   }

   if (params.length) videoFilter += `:${params.join(':')}`;
   return { videoFilter };
};
