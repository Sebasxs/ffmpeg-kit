// Core
export { MediaEditor } from '@/core/media-editor';
export { FFmpegBase } from '@/core/ffmpeg-base';

// Metadata and Utilities
export { getFileMetadata } from '@/lib/ffprobe';
export * from '@/lib/constants';

// Errors
export {
   FFmpegError,
   MissingStreamError,
   FFmpegCommandError,
   InvalidOutputPathError,
   InvalidFileExtensionError,
   InvalidMimeTypeError,
   MetadataError,
   NoParametersError,
   FileNotFoundError,
} from '@/lib/errors';

// Types
export type * from '@/types/ffmpeg';
export type * from '@/types/ffprobe';
export type * from '@/types/filters';

// Filters
export * from '@/filters';
