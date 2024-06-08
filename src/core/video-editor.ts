import { FFmpegNode } from '@/core/ffmpeg-node';
import { FFProbeResult, SimplifiedMetadata } from '@/types/ffprobe';

export class VideoEditor extends FFmpegNode {
   constructor(filePath: string | string[]) {
      super(filePath, 'video');
   }

   mute(): this {
      this._removeAudio = true;
      return this;
   }

   blind(): this {
      this._removeVideo = true;
      return this;
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
