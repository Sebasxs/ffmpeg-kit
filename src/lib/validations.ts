import { z, ZodType } from 'zod';
import { VolumeOptions } from '@/types/filters';

export const VolumeSchema = z.object({
   volume: z.union([z.number(), z.string()]),
   _eval: z.enum(['once', 'frame']).optional(),
}) satisfies ZodType<VolumeOptions>;
