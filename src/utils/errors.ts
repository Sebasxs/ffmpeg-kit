export class FFmpegError extends Error {
   constructor(message: string) {
      super(message);
      this.name = 'FFmpegError';
   }
}

export class MissingStreamError extends FFmpegError {
   constructor(streamType: 'audio' | 'video' | 'audio/video', filterName: string) {
      super(`Missing ${streamType} stream for filter "${filterName}".`);
      this.name = 'MissingStreamError';
   }
}

export class FFmpegCommandError extends FFmpegError {
   constructor(command: string, stderr: string) {
      super(`FFmpeg command failed: ${command}\nFFmpeg stderr:\n${stderr}`);
      this.name = 'FFmpegCommandError';
   }
}

export class InvalidOutputPathError extends FFmpegError {
   constructor(message: string) {
      super(`Invalid output path: ${message}`);
      this.name = 'InvalidOutputPathError';
   }
}

export class InvalidFileExtensionError extends FFmpegError {
   constructor(extension: string) {
      super(`Invalid file extension: ${extension}`);
      this.name = 'InvalidFileExtensionError';
   }
}

export class InvalidMimeTypeError extends FFmpegError {
   constructor(mimeType: string) {
      super(`Invalid mime type: ${mimeType}`);
      this.name = 'InvalidMimeTypeError';
   }
}

export class MetadataError extends FFmpegError {
   constructor(message: string) {
      super(`Error getting metadata: ${message}`);
      this.name = 'MetadataError';
   }
}
