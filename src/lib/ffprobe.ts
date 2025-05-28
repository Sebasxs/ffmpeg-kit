import { FFProbeResult } from '@/types/ffprobe';
import { spawnSync } from 'node:child_process';
import { MetadataError } from './errors';

export function getFileMetadata(path: string): FFProbeResult {
   try {
      const result = spawnSync(
         'ffprobe',
         ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', path],
         {
            encoding: 'utf-8',
            windowsHide: true,
            maxBuffer: 10 * 1024 * 1024,
         },
      );

      if (result.error) {
         throw new MetadataError(result.error.message);
      }

      if (result.status !== 0) {
         throw new MetadataError(
            result.stderr ? result.stderr.toString() : `ffprobe exited with code ${result.status}`,
         );
      }

      const { streams, format } = JSON.parse(result.stdout) as FFProbeResult;

      const videoStream = streams.find((source) => source.codec_type === 'video');
      const audioStream = streams.find((source) => source.codec_type === 'audio');

      const getFrameRate = (frameRate: string | undefined) => {
         if (!frameRate) return undefined;
         const [numerator, denominator] = frameRate.split('/');
         return Number(numerator) / Number(denominator);
      };

      const parseProperty = (property: string | undefined) => {
         if (!property) return undefined;
         return parseInt(property, 10);
      };

      const summary = {
         hasAudio: !!audioStream,
         hasVideo: !!videoStream,
         duration: parseProperty(format.duration),
         size: parseProperty(format.size),
         bitRate: parseProperty(format.bit_rate),
         height: videoStream?.height,
         width: videoStream?.width,
         aspectRatio: videoStream?.display_aspect_ratio,
         frameCount: parseProperty(videoStream?.nb_frames),
         frameRate: getFrameRate(videoStream?.r_frame_rate),
         audioChannels: audioStream?.channels,
         audioSampleRate: parseProperty(audioStream?.sample_rate),
         formatName: format.format_name,
         tags: format.tags || {},
      };

      return { streams, format, summary };
   } catch (error: any) {
      throw new MetadataError(error.message);
   }
}
