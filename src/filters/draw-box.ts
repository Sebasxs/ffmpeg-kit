import { DrawBoxBuilder, DrawBoxOptions } from '@/types/filters';

const buildBoxParams = (options: Omit<DrawBoxOptions, 'fillColor' | 'borderColor'>) => {
   const { x, y, width, height, enable } = options || {};
   const params: string[] = [];

   const addParam = (key: string, value: string | number) => {
      if (typeof value === 'number') params.push(`${key}=${value}`);
      else params.push(`${key}='${value}'`);
   };

   if (x !== undefined) addParam('x', x);
   if (y !== undefined) addParam('y', y);
   if (width !== undefined) addParam('w', width);
   if (height !== undefined) addParam('h', height);
   if (enable !== undefined) {
      if (typeof enable === 'string') addParam('enable', enable);
      else addParam('enable', Number(enable));
   }

   return params.join(':');
};

export const DrawBoxFilter: DrawBoxBuilder = (options) => {
   const { x, y, width, height, fillColor, borderColor, thickness, enable } = options;
   const filters = [];
   const boxParams = buildBoxParams({ x, y, width, height, enable });

   if (fillColor !== undefined) {
      filters.push(`drawbox=${boxParams}:t=fill:color=${fillColor}`);
   }
   if (borderColor !== undefined || thickness !== undefined) {
      let borderFilter = `drawbox=${boxParams}:color=${borderColor ?? 'gray@1'}`;
      if (thickness !== undefined) borderFilter += `:t=${thickness}`;
      filters.push(borderFilter);
   }

   return { videoFilter: filters.join(',') };
};
