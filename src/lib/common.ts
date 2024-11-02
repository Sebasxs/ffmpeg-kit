export const buildParam = (key: string, value: string | number) => {
   if (/[a-zA-Z0-9.]+/.test(value.toString())) return `${key}=${value}`;
   else return `${key}='${value}'`;
};
export const colorHasAlpha = (color: string | undefined) => {
   if (!color) return false;
   const colorCleaned = color.replace(/^#|^0x/i, '');
   const hexWithAlphaRegex = /^[0-9a-fA-F]{8}$/;
   return hexWithAlphaRegex.test(colorCleaned) || color.includes('@') || color.includes('a=');
};
