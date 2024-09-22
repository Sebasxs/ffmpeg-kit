export class FFmpegError extends Error {
   constructor(message: string) {
      super(message);
      this.name = 'FFmpegError';
   }
}

export class MissingStreamError extends FFmpegError {
   constructor(streamType: 'audio' | 'video' | 'audio/video', filterName: string) {
      super(`missing ${streamType} stream for filter "${filterName}".`);
      this.name = 'MissingStreamError';
   }
}

export class FFmpegCommandError extends FFmpegError {
   constructor(command: string, stderr: string) {
      super(`${command}\n\nFFmpeg stderr:\n\n${stderr}`);
      this.name = 'FFmpegCommandError';
   }
}

export class InvalidOutputPathError extends FFmpegError {
   constructor(message: string) {
      super(message);
      this.name = 'InvalidOutputPathError';
   }
}

export class InvalidFileExtensionError extends FFmpegError {
   constructor(extension: string) {
      super(extension);
      this.name = 'InvalidFileExtensionError';
   }
}

export class InvalidMimeTypeError extends FFmpegError {
   constructor(mimeType: string) {
      super(mimeType);
      this.name = 'InvalidMimeTypeError';
   }
}

export class MetadataError extends FFmpegError {
   constructor(message: string) {
      super(message);
      this.name = 'MetadataError';
   }
}

export class NoParametersError extends FFmpegError {
   constructor(filterName: string) {
      super(`no parameters provided for filter "${filterName}".`);
      this.name = 'NoParametersError';
   }
}

export class FileNotFoundError extends FFmpegError {
   constructor(path: string) {
      super(path);
      this.name = 'FileNotFoundError';
   }
}
