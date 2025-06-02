<div align="center">
  <h1>ffmpeg-kit</h1>
  <p>Simplifies audio and video editing with FFmpeg’s core features, without any command-line hassle.</p>
</div>

<br>

![](https://i.imgur.com/kStMysx.png)

## Overview

Working with FFmpeg directly from Node.js can quickly become tedious and error-prone. Crafting complex `-filter_complex` graphs, calculating stream delays, escaping special characters, and remembering cryptic command-line arguments takes time and introduces subtle bugs.

**ffmpeg-kit** provides a fluent, chainable, and fully type-safe TypeScript/JavaScript interface over FFmpeg. It abstracts the underlying command-line complexity into intuitive methods with runtime validation, non-blocking asynchronous execution, and automated stream mapping.

![](https://i.imgur.com/kStMysx.png)

## Key Features

- **Fluent Chaining API:** Chain audio and video operations seamlessly (`.trim()`, `.fade()`, `.crop()`, `.volume()`).
- **Type-Safe & Validated:** Built in TypeScript with strict typings and runtime parameter validation powered by Zod.
- **Non-Blocking Asynchronous Processing:** Execute rendering operations with `runAsync()` without freezing the Node.js event loop.
- **Secure Process Spawning:** Uses token-based argument execution via `node:child_process` (`spawn`), eliminating shell injection risks and handling paths with spaces natively.
- **Automated Filter Graph Composition:** Automatically generates complex filter graphs, stream labels, and codec configurations.
- **Comprehensive Filter Suite:** Over 30 built-in filters covering video geometry, color correction, audio enhancements, subtitles, and multi-input overlays.
- **Integrated Metadata Extraction:** Built-in `getFileMetadata` using `ffprobe` to inspect durations, dimensions, bitrates, and streams.

<br>

![](https://i.imgur.com/kStMysx.png)

## Prerequisites

This library acts as a native wrapper, so **FFmpeg** and **ffprobe** must be installed and accessible in your system's `PATH`.

```bash
# Verify installation
ffmpeg -version
ffprobe -version
```

<br>

## Installation

Install using your preferred package manager:

```bash
pnpm add ffmpeg-kit
```

```bash
npm install ffmpeg-kit
```

```bash
yarn add ffmpeg-kit
```

<br>

![](https://i.imgur.com/kStMysx.png)

## Usage

### 1. Quick Start: Trim, Fade & Flip Video

```typescript
import { MediaEditor } from 'ffmpeg-kit';

async function processVideo() {
  const editor = new MediaEditor('input.mp4');

  await editor
    .trim({ start: 2, end: 10 })
    .fade({ type: 'in', duration: 1, color: 'Black' })
    .flip('horizontal')
    .runAsync('output.mp4');

  console.log('Video processed successfully!');
}

processVideo();
```

---

### 2. Video Transformation: Crop & Scale

Adjust video resolution, aspect ratios, and dimensions with automatic parity alignment:

```typescript
import { MediaEditor } from 'ffmpeg-kit';

const editor = new MediaEditor('input.mp4');

// Crop to 1:1 square ratio and scale to 1080p
await editor
  .crop({ aspectRatio: '1:1' })
  .scale({ width: 1080, height: 1080 })
  .runAsync('square_1080p.mp4');
```

---

### 3. Subtitles & Picture-in-Picture Overlay

Render subtitles with custom styles and overlay a secondary video or watermark logo:

```typescript
import { MediaEditor } from 'ffmpeg-kit';

const editor = new MediaEditor('interview.mp4');

await editor
  .subtitles('captions.srt', {
    fontSize: 24,
    fontName: 'Arial',
    primaryColor: '&H00FFFFFF',
  })
  .overlay('watermark.png', {
    x: 30,
    y: 30,
  })
  .runAsync('final_presentation.mp4');
```

---

### 4. Audio Processing: Volume, Normalization & Pitch

Enhance audio tracks with volume control, loudness normalization, and speed adjustment:

```typescript
import { MediaEditor } from 'ffmpeg-kit';

const editor = new MediaEditor('podcast.mp3');

await editor
  .volume({ volume: '150%' })
  .loudnorm({ average: -16, range: 7, peak: -1.5 })
  .pitch(1.1) // Slightly pitch up without desynchronization
  .runAsync('podcast_mastered.mp3');
```

---

### 5. Inspecting Media Metadata (`getFileMetadata`)

Extract detailed stream information, dimensions, codecs, and durations before processing:

```typescript
import { getFileMetadata } from 'ffmpeg-kit';

const metadata = getFileMetadata('video.mp4');

console.log('Duration (seconds):', metadata.format.duration);
console.log('Streams count:', metadata.streams.length);

const videoStream = metadata.streams.find(s => s.codec_type === 'video');
if (videoStream) {
  console.log(`Resolution: ${videoStream.width}x${videoStream.height}`);
  console.log(`Codec: ${videoStream.codec_name}`);
}
```

---

### 6. Output Options (Bitrate, Codec, FPS & Overwrite)

Configure encoding flags and parameters through the second argument of `runAsync` or `run`:

```typescript
import { MediaEditor } from 'ffmpeg-kit';

await new MediaEditor('raw_footage.mov')
  .scale({ width: 1920, height: 1080 })
  .runAsync('optimized.mp4', {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    fps: 30,
    crf: 23,
    preset: 'fast',
    overwrite: true,
  });
```

<br>

![](https://i.imgur.com/kStMysx.png)

## Supported Filters

| Category | Filters | Description |
| :--- | :--- | :--- |
| **Geometry & Motion** | `scale`, `crop`, `pad`, `rotate`, `flip`, `deshake` | Resize, reposition, aspect ratio adjustment, and stabilization. |
| **Color & Look** | `brightness`, `hue`, `colorBalance`, `colorMixer`, `colorMultiplier`, `removeColor`, `grayscale`, `lut`, `negate` | Color grading, LUT presets (cyberpunk, sepia, vibrant, etc.), and adjustments. |
| **Effects & Text** | `fade`, `blur`, `denoise`, `alpha`, `drawText`, `drawBox` | Transitions, text overlays, boxes, and transparency controls. |
| **Multi-Media & Subs**| `overlay`, `subtitles` | Watermarking, picture-in-picture, and custom ASS/SRT caption styling. |
| **Audio Controls** | `volume`, `loudnorm`, `dynaudnorm`, `pitch`, `pan`, `delay`, `reverse`, `speed` | Volume levels, broadcast loudness standards, tempo, and channel panning. |

<br>

![](https://i.imgur.com/kStMysx.png)

## License

This project is licensed under the [MIT License](LICENSE).
