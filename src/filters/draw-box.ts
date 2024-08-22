import { DrawBoxBuilder, DrawBoxOptions } from '@/types/filters';
import { buildParam } from '@/lib/common';

const buildBoxParams = (options: Omit<DrawBoxOptions, 'fillColor' | 'borderColor'>) => {
   const { x, y, width, height, enable } = options || {};
   const params: string[] = [];

   if (x !== undefined) params.push(buildParam('x', x));
   if (y !== undefined) params.push(buildParam('y', y));
   if (width !== undefined) params.push(buildParam('w', width));
   if (height !== undefined) params.push(buildParam('h', height));
   if (enable !== undefined) {
      if (typeof enable === 'string') params.push(buildParam('enable', enable));
      else params.push(buildParam('enable', Number(enable)));
   }

   return params.join(':');
};

export const DrawBoxFilter: DrawBoxBuilder = (options) => {
   const { x, y, width, height, fillColor, borderColor, thickness, enable } = options;
   const filters = [];
   const boxParams = buildBoxParams({ x, y, width, height, enable });

   if (fillColor !== undefined) {
      const colorParam = buildParam('color', fillColor);
      filters.push(`drawbox=${boxParams}:t=fill:${colorParam}`);
   }
   if (borderColor !== undefined || thickness !== undefined) {
      const colorParam = buildParam('color', borderColor ?? "'gray'");
      let borderFilter = `drawbox=${boxParams}:${colorParam}`;
      if (thickness !== undefined) borderFilter += `:t=${thickness}`;
      filters.push(borderFilter);
   }

   return { videoFilter: filters.join(',') };
};
