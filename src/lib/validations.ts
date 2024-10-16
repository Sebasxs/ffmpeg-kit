// @packages
import { z, ZodType } from 'zod';

// @types
import {
   BrightnessOptions,
   ColorBalanceOptions,
   ColorChannelMixerOptions,
   ColorMultiplierOptions,
   CropOptions,
   DeshakeOptions,
   DrawBoxOptions,
   DrawTextOptions,
   DynaudnormOptions,
   FadeOptions,
   HueOptions,
   LoudnormOptions,
   PadOptions,
   PanOptions,
   RotateOptions,
   ScaleOptions,
   TrimOptions,
   VolumeOptions,
} from '@/types/filters';

// @utils
import { ColorPresets, Curves, ScaleFlags, TextAlign } from './constants';

export const VolumeSchema = z.object({
   volume: z.union([z.number(), z.string()]),
   _eval: z.enum(['once', 'frame']).optional(),
}) satisfies ZodType<VolumeOptions>;

export const LoudnormSchema = z.object({
   average: z.number().gte(-70).lte(-5).default(-23),
   range: z.number().gte(1).lte(50).default(9).optional(),
   peak: z.number().gte(-9).lte(0).default(-1).optional(),
}) satisfies ZodType<LoudnormOptions>;

export const DynaudnormSchema = z.object({
   frameLength: z.number().gte(10).lte(8000).default(200),
   gaussSize: z
      .number()
      .gte(3)
      .lte(301)
      .refine((val) => val % 2 !== 0, { error: 'Gauss size must be an odd number' })
      .optional(),
   peak: z.number().gte(0).lte(1).default(0.9),
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
      aspectRatio: z.string().refine((val) => /^\d+:\d+$/.test(val), {
         error: 'Invalid aspect ratio',
      }),
      x: z.union([z.string(), z.number()]).optional(),
      y: z.union([z.string(), z.number()]).optional(),
   }),
   z.object({
      width: z.union([z.string(), z.number().gt(10)]).default('iw'),
      height: z.union([z.string(), z.number().gt(10)]).default('ih'),
      x: z.union([z.string(), z.number()]).optional(),
      y: z.union([z.string(), z.number()]).optional(),
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

export const DenoiseSchema = z.enum(['hqdn3d', 'nlmeans', 'atadenoise', 'afftdn']);

export const RotateSchema = z.union([
   z.object({
      degrees: z.number().gte(-360).lte(360),
      outputWidth: z.union([z.number().positive(), z.string()]).optional(),
      outputHeight: z.union([z.number().positive(), z.string()]).optional(),
      emptyAreaColor: z.string().default('black@0'),
   }),
   z.object({
      expression: z.string(),
      outputWidth: z.union([z.number().positive(), z.string()]).optional(),
      outputHeight: z.union([z.number().positive(), z.string()]).optional(),
      emptyAreaColor: z.string().default('black@0'),
   }),
]) satisfies ZodType<RotateOptions>;

export const AlphaSchema = z.number().gte(0).lte(1);

export const PadSchema = z.object({
   width: z.union([z.number().positive(), z.string()]),
   height: z.union([z.number().positive(), z.string()]),
   x: z.union([z.number().positive(), z.string()]).optional(),
   y: z.union([z.number().positive(), z.string()]).optional(),
   color: z.string().default('black'),
}) satisfies ZodType<PadOptions>;

export const DelaySchema = z.number().gt(0);

export const NegateSchema = z.boolean().default(false);

export const BrightnessSchema = z
   .object({
      brightness: z.union([z.number().gte(-1).lte(1), z.string()]),
      contrast: z.union([z.number().gte(-1000).lte(1000), z.string()]),
      saturation: z.union([z.number().gte(0).lte(3), z.string()]),
      gamma: z.union([z.number().gte(0.1).lte(10), z.string()]),
   })
   .partial()
   .refine((data) => Object.keys(data).length > 0, {
      error: 'At least one of brightness, contrast, saturation or gamma must be provided',
   }) satisfies ZodType<BrightnessOptions>;

export const HueSchema = z.union([
   z.object({
      degrees: z.number().gte(-360).lte(360),
      saturation: z.union([z.number().gte(-10).lte(10), z.string()]),
      brightness: z.union([z.number().gte(-10).lte(10), z.string()]),
   }),
   z.object({
      expression: z.string(),
      saturation: z.union([z.number().gte(-10).lte(10), z.string()]),
      brightness: z.union([z.number().gte(-10).lte(10), z.string()]),
   }),
]) satisfies ZodType<HueOptions>;

export const ColorBalanceSchema = z
   .object({
      redShadows: z.number().gte(-1).lte(1),
      greenShadows: z.number().gte(-1).lte(1),
      blueShadows: z.number().gte(-1).lte(1),
      redMidtones: z.number().gte(-1).lte(1),
      greenMidtones: z.number().gte(-1).lte(1),
      blueMidtones: z.number().gte(-1).lte(1),
      redHighlights: z.number().gte(-1).lte(1),
      greenHighlights: z.number().gte(-1).lte(1),
      blueHighlights: z.number().gte(-1).lte(1),
      preserveLightness: z.boolean(),
   })
   .partial()
   .refine((data) => Object.keys(data).length > 0, {
      error: 'At least one of redShadows, greenShadows, blueShadows, redMidtones, greenMidtones, blueMidtones',
   }) satisfies ZodType<ColorBalanceOptions>;

export const ColorMixerSchema = z
   .object({
      redInRed: z.number().gte(-2).lte(2),
      redInGreen: z.number().gte(-2).lte(2),
      redInBlue: z.number().gte(-2).lte(2),
      redInAlpha: z.number().gte(-2).lte(2),
      greenInRed: z.number().gte(-2).lte(2),
      greenInGreen: z.number().gte(-2).lte(2),
      greenInBlue: z.number().gte(-2).lte(2),
      greenInAlpha: z.number().gte(-2).lte(2),
      blueInRed: z.number().gte(-2).lte(2),
      blueInGreen: z.number().gte(-2).lte(2),
      blueInBlue: z.number().gte(-2).lte(2),
      blueInAlpha: z.number().gte(-2).lte(2),
      alphaInRed: z.number().gte(-2).lte(2),
      alphaInGreen: z.number().gte(-2).lte(2),
      alphaInBlue: z.number().gte(-2).lte(2),
      alphaInAlpha: z.number().gte(-2).lte(2),
      preserveColorMode: z.enum(['none', 'lum', 'max', 'avg', 'sum', 'nrm', 'pwr']),
      preserveColorAmount: z.number().gte(0).lte(1),
   })
   .partial()
   .refine((data) => Object.keys(data).length > 0, {
      error: 'At least one value in ColorMixer must be provided',
   }) satisfies ZodType<ColorChannelMixerOptions>;

export const ColorPresetSchema = z.enum(ColorPresets);

export const ColorMultiplierSchema = z
   .object({
      red: z.union([z.number().gte(0).lte(10), z.string()]),
      green: z.union([z.number().gte(0).lte(10), z.string()]),
      blue: z.union([z.number().gte(0).lte(10), z.string()]),
      alpha: z.union([z.number().gte(0).lte(10), z.string()]),
   })
   .partial()
   .refine((data) => Object.keys(data).length > 0, {
      error: 'At least one value in ColorMixer must be provided',
   }) satisfies ZodType<ColorMultiplierOptions>;

export const DeshakeSchema = z
   .object({
      x: z.number().gte(-1).lte(1),
      y: z.number().gte(-1).lte(1),
      width: z.int().min(-1).max(1),
      height: z.int().min(-1).max(1),
      motionRangeX: z.int().min(0).max(64),
      motionRangeY: z.int().min(0).max(64),
      edge: z.enum(['blank', 'clamp', 'mirror', 'original']),
      blocksize: z.int().min(4).max(128),
      contrast: z.int().min(1).max(265),
   })
   .partial() satisfies ZodType<DeshakeOptions>;

export const PanSchema = z.object({
   layout: z.enum(['mono', 'stereo', '5.1', '7.1']),
   channels: z.union([z.number(), z.string()]).array(),
}) satisfies ZodType<PanOptions>;

export const DrawTextSchema = z.object({
   text: z.string(),
   textAlign: z.enum(TextAlign).optional(),
   lineSpacing: z.number().gte(0).optional(),
   fontFile: z.string().optional(),
   fontSize: z.int().positive().optional(),
   fontColor: z.string().optional(),
   x: z.union([z.number(), z.string()]).optional(),
   y: z.union([z.number(), z.string()]).optional(),
   borderWidth: z.number().gte(0).optional(),
   borderColor: z.string().optional(),
   shadowX: z.int().optional(),
   shadowY: z.int().optional(),
   shadowColor: z.string().optional(),
   box: z.boolean().optional(),
   boxColor: z.string().optional(),
   boxBorderWidth: z.number().array().optional(),
   enable: z.union([z.string(), z.boolean()]).optional(),
}) satisfies ZodType<DrawTextOptions>;

export const DraBoxSchema = z.object({
   x: z.union([z.number(), z.string()]),
   y: z.union([z.number(), z.string()]),
   width: z.union([z.number(), z.string()]),
   height: z.union([z.number(), z.string()]),
   fillColor: z.string().optional(),
   borderColor: z.string().optional(),
   thickness: z.number().gt(0).optional(),
   enable: z.union([z.string(), z.boolean()]).optional(),
}) satisfies ZodType<DrawBoxOptions>;
