import { FFmpegBase } from '@/core/ffmpeg-base';
import { BuildVolumeFilter } from '@/filters/volume';
import { VolumeOptions } from '@/types/filters';

export class MediaLayer extends FFmpegBase {
   constructor(filePath: string | string[]) {
      super(filePath);
   }

   volume(options: VolumeOptions): this {
      if (!this.hasAudioStream()) {
         throw new Error('Volume filter can only be applied to audio streams.');
      }

      const { audioFilter } = BuildVolumeFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }
}
