import { SubtitleBuilder } from '@/types/filters';

const escapeSubtitlePath = (filePath: string): string => {
   return filePath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\\\''");
};

export const SubtitlesFilter: SubtitleBuilder = (subtitlePath, options = {}) => {
   const escapedPath = escapeSubtitlePath(subtitlePath);
   const params: string[] = [`filename='${escapedPath}'`];

   const styles: string[] = [];
   if (options.fontName) styles.push(`FontName=${options.fontName}`);
   if (options.fontSize) styles.push(`FontSize=${options.fontSize}`);
   if (options.primaryColor) styles.push(`PrimaryColour=${options.primaryColor}`);
   if (options.forceStyle) styles.push(options.forceStyle);

   if (styles.length) {
      params.push(`force_style='${styles.join(',')}'`);
   }

   if (options.charenc) {
      params.push(`charenc='${options.charenc}'`);
   }

   return { videoFilter: `subtitles=${params.join(':')}` };
};
