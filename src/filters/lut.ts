import { LookUpTableBuilder } from '@/types/filters';

export const LutFilter: LookUpTableBuilder = (preset) => {
   let videoFilter = '';
   switch (preset) {
      case 'golden hour':
         videoFilter = 'lutrgb=r=1.2*val:g=1.1*val:b=0.8*val';
         break;
      case 'purple noir':
         videoFilter = 'lutrgb=r=0.8*val:g=0.7*val:b=1.2*val';
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
         videoFilter = 'lutrgb=r=1.2*val:g=1.2*val:b=1.2*val';
         break;
      case 'desaturated':
         videoFilter = 'lutrgb=r=0.8*val:g=0.8*val:b=0.8*val';
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
      case 'sepia':
         videoFilter = 'lutrgb=r=val*1.2:g=val*1.1:b=val*0.9';
         break;
   }

   return { videoFilter };
};
