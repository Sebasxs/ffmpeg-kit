// @packages
import { z, ZodType } from 'zod';

// @types
import {
   CropOptions,
   DynaudnormOptions,
   FadeOptions,
   LoudnormOptions,
   ScaleOptions,
   TrimOptions,
   VolumeOptions,
} from '@/types/filters';

// @utils
import { Curves, ScaleFlags } from './constants';

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

export const FadeSchema = z.object({
   type: z.enum(['in', 'out']),
   duration: z.number().gte(0.1),
   start: z.number().gte(0),
   curve: z.enum(Curves).optional(),
   color: z.string().optional(),
   stream: z.enum(['audio', 'video']).optional(),
}) satisfies ZodType<FadeOptions>;

export const CropSchema = z.union([
   z.object({
      fas: z.boolean(),
      width: z.union([z.string(), z.number().gt(10)]),
      height: z.union([z.string(), z.number().gt(10)]),
      x: z.union([z.string(), z.number()]).optional(),
      y: z.union([z.string(), z.number()]).optional(),
   }),
   z.object({
      aspectRatio: z.string().refine((val) => /^\d+:\d+$/.test(val), {
         error: 'Invalid aspect ratio',
      }),
   }),
]) satisfies ZodType<CropOptions>;

export const ScaleSchema = z.discriminatedUnion([
   z.object({
      flags: z.enum(ScaleFlags).optional(),
      percentage: z.number().gte(10).lte(200),
   }),
   z.object({
      flags: z.enum(ScaleFlags).optional(),
      width: z.union([z.string(), z.number().gt(10)]),
      height: z.union([z.string(), z.number().gt(10)]).optional(),
      forceAspectRatio: z.enum(['increase', 'decrease', 'disable']).optional(),
   }),
   z.object({
      flags: z.enum(ScaleFlags).optional(),
      width: z.union([z.string(), z.number().gt(10)]).optional(),
      height: z.union([z.string(), z.number().gt(10)]),
      forceAspectRatio: z.enum(['increase', 'decrease', 'disable']).optional(),
   }),
]) satisfies ZodType<ScaleOptions>;

export const SpeedSchema = z.number().gte(0.5).lte(100);

export const BlurSchema = z.number().gte(0.1).lte(50);

export const FlipSchema = z.enum(['horizontal', 'vertical', 'both']);
