export interface FFProbeStream {
   index: number;
   codec_name?: string;
   codec_long_name?: string;
   codec_type: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment';
   codec_tag_string?: string;
   codec_tag?: string;

   // Video-specific
   width?: number;
   height?: number;
   pix_fmt?: string;
   r_frame_rate?: string;
   avg_frame_rate?: string;
   time_base?: string;
   sample_aspect_ratio?: string;
   display_aspect_ratio?: string;
   level?: number;
   is_avc?: number;
   nal_length_size?: number;
   bits_per_raw_sample?: string;

   // Audio-specific
   sample_rate?: string;
   channels?: number;
   channel_layout?: string;
   bits_per_sample?: number;

   // Common fields
   duration?: string;
   bit_rate?: string;
   nb_frames?: string;
   nb_read_frames?: string;
   nb_read_packets?: string;

   disposition?: FFProbeDisposition;
   tags?: Record<string, string>;
}

export interface FFProbeDisposition {
   default?: number;
   forced?: number;
   hearing_impaired?: number;
   visual_impaired?: number;
   clean_effects?: number;
   attached_pic?: number;
   captions?: number;
   descriptions?: number;
   metadata?: number;
}

export interface FFProbeFormat {
   filename: string;
   nb_streams: number;
   format_name: string;
   duration?: string;
   size?: string;
   bit_rate?: string;
   tags?: Record<string, string>;
}

export interface FFProbeResult {
   streams: FFProbeStream[];
   format: FFProbeFormat;
   summary: SimplifiedMetadata;
}

interface SimplifiedMetadata {
   hasAudio: boolean;
   hasVideo: boolean;
   duration?: number; // seconds
   size?: number; // bytes
   bitRate?: number; // bps
   height?: number;
   width?: number;
   aspectRatio?: string;
   frameCount?: number;
   frameRate?: number; // FPS
   audioChannels?: number;
   audioSampleRate?: number; // Hz
   formatName?: string;
   tags?: Record<string, string>;
}
