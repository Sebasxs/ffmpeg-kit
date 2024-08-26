import { z, ZodType } from 'zod';
import { DynaudnormOptions, LoudnormOptions, TrimOptions, VolumeOptions } from '@/types/filters';

export const VolumeSchema = z.object({
   volume: z.union([z.number(), z.string()]),
   _eval: z.enum(['once', 'frame']).optional(),
}) satisfies ZodType<VolumeOptions>;

export const LoudnormSchema = z.object({
   average: z.number().gte(-70).lte(-5).default(-23).optional(),
   range: z.number().gte(1).lte(50).default(9).optional(),
   peak: z.number().gte(-9).lte(0).default(-1).optional(),
}) satisfies ZodType<LoudnormOptions>;

export const DynaudnormSchema = z.object({
   frameLength: z.number().gte(10).lte(8000).default(200).optional(),
   gaussSize: z
      .number()
      .gte(3)
      .lte(301)
      .refine((val) => val % 2 !== 0, { error: 'Gauss size must be an odd number' })
      .optional(),
   peak: z.number().gte(0).lte(1).default(0.9).optional(),
   lteGain: z.number().gte(1).lte(100).optional(),
   rms: z.number().gte(0).lte(1).optional(),
   compress: z.number().gte(1).lte(30).optional(),
   threshold: z.number().gte(0).lte(1).optional(),
}) satisfies ZodType<DynaudnormOptions>;

export const PitchSchema = z.number().gte(0.125).lte(8);

export const TrimSchema = z.object({
   stream: z.enum(['audio', 'video']).optional(),
   start: z.union([z.number().gte(0), z.string()]),
   end: z.union([z.number().gt(0), z.string()]).optional(),
   duration: z.union([z.number().gt(0), z.string()]).optional(),
}) satisfies ZodType<TrimOptions>;
