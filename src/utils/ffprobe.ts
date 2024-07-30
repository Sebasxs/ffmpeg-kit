import { FFProbeResult } from '@/types/ffprobe';
import { execSync } from 'child_process';
import { MetadataError } from './errors';

export function getFileMetadata(path: string): FFProbeResult {
   const cmd = `ffprobe -v quiet -print_format json -show_format -show_streams "${path}"`;
   try {
      const result = execSync(cmd, { encoding: 'utf-8' });
      const { streams, format } = JSON.parse(result) as FFProbeResult;

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
      throw new MetadataError(`Failed to get media info: ${error.message}`);
   }
}
