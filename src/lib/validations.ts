import { z, ZodType } from 'zod';
import { LoudnormOptions, VolumeOptions } from '@/types/filters';

export const VolumeSchema = z.object({
   volume: z.union([z.number(), z.string()]),
   _eval: z.enum(['once', 'frame']).optional(),
}) satisfies ZodType<VolumeOptions>;

export const LoudnormSchema = z.object({
   average: z.number().min(-70).max(-5).default(-23).optional(),
   range: z.number().min(1).max(50).default(9).optional(),
   peak: z.number().min(-9).max(0).default(-1).optional(),
}) satisfies ZodType<LoudnormOptions>;
