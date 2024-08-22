export const buildParam = (key: string, value: string | number) => {
   if (/[a-zA-Z0-9.]+/.test(value.toString())) return `${key}=${value}`;
   else return `${key}='${value}'`;
};
