import { LookUpTableBuilder } from '@/types/filters';

export const LutFilter: LookUpTableBuilder = (preset) => {
   let videoFilter = '';
   switch (preset) {
      case 'sepia':
         videoFilter =
            'lutrgb=r=0.393*r+0.769*g+0.189*b:g=0.349*r+0.686*g+0.168*b:b=0.272*r+0.534*g+0.131*b';
         break;
      case 'golden hour':
         videoFilter = 'lutrgb=r=1.2*r:g=1.1*g:b=0.8*b';
         break;
      case 'purple noir':
         videoFilter = 'lutrgb=r=0.8*r:g=0.7*g:b=1.2*b';
         break;
      case 'grayscale':
         videoFilter = 'lutyuv=y=val:u=128:v=128';
         break;
      case 'moonlight':
         videoFilter = "lutrgb=r='clipval*0.85':g='clipval*0.95':b='min(maxval,clipval*1.1)'";
         break;
      case 'teal & orange':
         videoFilter = "lutrgb=r='min(maxval,clipval*1.08)':g='clipval*0.97':b='clipval*0.9'";
         break;
      case 'vibrant':
         videoFilter = 'lutrgb=r=1.2*r:g=1.2*g:b=1.2*b';
         break;
      case 'desaturated':
         videoFilter = 'lutrgb=r=0.8*r:g=0.8*g:b=0.8*b';
         break;
      case 'negative':
         videoFilter = 'lutrgb=r=negval:g=negval:b=negval';
         break;
      case 'matrix code green':
         videoFilter = 'lutrgb=r=val*0.5:g=val*1.5:b=val*0.5';
         break;
      case 'cyberpunk':
         videoFilter = 'lutrgb=r=val*0.7:g=val*0.3:b=val*1.4';
         break;
      case 'vintage film':
         videoFilter = 'lutrgb=r=val*1.2:g=val*1.1:b=val*0.9';
         break;
   }

   return { videoFilter };
};
