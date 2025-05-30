import { MediaEditor } from '../src/index';

async function main() {
   console.log('--- ffmpeg-kit Demonstration ---');

   // 1. Process video with multiple fluent filters
   console.log('Rendering video with trim, fade, crop and flip...');
   const result1 = await new MediaEditor('examples/assets/vid.mp4')
      .removeColor({ red: true })
      .trim({ end: 3 })
      .fade({ type: 'in', duration: 1, color: 'Black' })
      .flip('horizontal')
      .crop({ aspectRatio: '1:1' })
      .runAsync('examples/assets/vid_demo_out.mp4');

   console.log('Result 1 command:', result1);

   // 2. Subtitles and overlay demonstration
   console.log('Rendering video with subtitles and overlay...');
   const result2 = await new MediaEditor('examples/assets/vid.mp4')
      .trim({ end: 3 })
      .subtitles('examples/assets/sample_subtitles.srt', { fontSize: 28 })
      .overlay('examples/assets/vid.mp4', { x: 20, y: 20 })
      .runAsync('examples/assets/vid_demo_overlay.mp4');

   console.log('Result 2 command:', result2);
   console.log('--- Demonstration Complete ---');
}

main().catch(console.error);
