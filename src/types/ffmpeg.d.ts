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
