// Core
export { MediaEditor } from './core/media-editor.js';
export { FFmpegBase } from './core/ffmpeg-base.js';

// Metadata and Utilities
export { getFileMetadata } from './lib/ffprobe.js';
export * from './lib/constants.js';

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
} from './lib/errors.js';

// Types
export type * from './types/ffmpeg.js';
export type * from './types/ffprobe.js';
export type * from './types/filters.js';

// Filters
export * from './filters/index.js';
