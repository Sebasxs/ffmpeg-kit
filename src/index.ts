import { MediaEditor } from '@/core/media-editor';

const vid = new MediaEditor('src/vid.mp4')
   .removeColor({ red: true })
   .trim({ end: 4 })
   .fade({ type: 'in', duration: 2, color: 'Black' })
   .fade({ type: 'out', duration: 1, color: 'pink', start: 2 })
   .flip('horizontal')
   .crop({ aspectRatio: '1:1' })
   .run('src/vid_out.mp4');

console.log(vid);
