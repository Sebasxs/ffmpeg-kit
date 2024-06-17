import { FFmpegBase } from '@/core/ffmpeg-base';
import { BuildNormalizeFilter } from '@/filters/normalize';
import { BuildVolumeFilter } from '@/filters/volume';
import { NormalizeOptions, VolumeOptions } from '@/types/filters';

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

   normalize(options: NormalizeOptions = { I: -23, LRA: 9, TP: -1 }): this {
      if (!this.hasAudioStream()) {
         throw new Error('Normalize filter can only be applied to audio streams.');
      }

      const { audioFilter } = BuildNormalizeFilter(options);
      this.addAudioFilter(audioFilter);
      return this;
   }
}
