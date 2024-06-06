import { FFmpegNode } from '@/core/ffmpeg-node';
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';

export class ImageEditor extends FFmpegNode {
   constructor(filePath: string | string[]) {
      super(filePath, 'image');
   }

   getMetadata(): SimplifiedMetadata {
      const path = this.getPath();
      return super.getFileMetadata(path!);
   }

   getFullMetadata(): FFProbeResult {
      const path = this.getPath();
      return super.getFileMetadata(path!, true);
   }
}
