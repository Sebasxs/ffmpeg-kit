import { SimplifiedMetadata } from '@/core/ffprobe';

export type MediaType = 'audio' | 'image' | 'video';

export type MediaInput = {
   path: string;
   type: MediaType;
   metadata: SimplifiedMetadata;
};

export interface AddFilterParams {
   filter: string;
   inputs?: string[];
   outputTag?: string;
}

export interface FFmpegBaseData {
   inputs: Map<string, MediaInput>;
   filterGraphParts: string[];
   outputAudioTag: string | null;
   outputVideoTag: string | null;
}

export type AudioCodec = 'aac' | 'mp3' | 'opus' | 'flac' | 'vorbis' | 'copy' | (string & {});

export type VideoCodec = 'libx264' | 'libx265' | 'vp9' | 'av1' | 'copy' | (string & {});

export type Preset =
   | 'ultrafast'
   | 'superfast'
   | 'veryfast'
   | 'faster'
   | 'fast'
   | 'medium'
   | 'slow'
   | 'slower'
   | 'veryslow';

export type PixelFormat =
   | 'yuv420p'
   | 'yuv422p'
   | 'yuv444p'
   | 'rgb24'
   | 'rgba'
   | 'gray'
   | 'gray16le'
   | 'yuva420p'
   | (string & {});

export interface OutputOptions {
   audioCodec?: AudioCodec;
   videoCodec?: VideoCodec;
   channels?: 1 | 2 | 5 | 7;
   fps?: number;
   audioBitrate?: `${number}k`;
   videoBitrate?: `${number}M`;
   crf?: number;
   preset?: Preset;
   duration?: number;
   shortest?: boolean;
   pixelFormat?: PixelFormat;
   overwrite?: boolean;
   audioNone?: boolean;
   videoNone?: boolean;
}

export interface PrepareInputOptionsParams {
   overwrite: boolean;
   inputs: Map<string, MediaInput>;
   filterGraphParts: string[];
   outputVideoTag: string | null;
   outputAudioTag: string | null;
   mimeType: string;
}

export interface BuildCommandParams {
   output: string;
   inputOptions: string[];
   outputOptions: string[];
   filterComplex: string;
   mapAudio: string | null;
   mapVideo: string | null;
}

export interface PrepareOutputOptionsParams {
   inputs: Map<string, MediaInput>;
   audioTag: string | null;
   videoTag: string | null;
   mimeType: string;
   options: OutputOptions;
}
