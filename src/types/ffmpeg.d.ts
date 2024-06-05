export type MediaType = 'audio' | 'image' | 'video';

export type MediaInput = {
   path: string;
   type: MediaType;
};

export interface AddFilterParams {
   filter: string;
   ref: string;
   inputs?: string[];
   outputTag?: string;
}

export interface FFmpegNodeData {
   inputs: Map<string, MediaInput>;
   filterGraphParts: string[];
   outputAudioTag: string | null;
   outputVideoTag: string | null;
}

// type AtLeastOne<T, K extends keyof T = keyof T> => {
//    [P in K]-?: Required<Pick<T, P>> & Partial<Omit<T, P>>;
// }[K];
