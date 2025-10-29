import { z } from 'zod';

export const ShootingSchema = z.object({
  id: z.number(),

  date_of_application: z.string().nullable().optional(), // ISO date or null
  name_of_outfit: z.string().max(1000).nullable().optional(),
  program_title: z.string().max(1000).nullable().optional(),
  location: z.string().max(1000).nullable().optional(),
  time: z.string().max(1000).nullable().optional(),
  date_of_shooting: z.string().nullable().optional(), // ISO date or null
  requested_by: z.string().max(1000).nullable().optional(),
  or_no: z.string().max(255).nullable().optional(),
  amount_paid: z.number().nullable().optional(),
  remarks: z.string().nullable().optional(),

  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable().optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ShootingParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
});

export const ShootingFormDataSchema = ShootingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Shooting = z.infer<typeof ShootingSchema>;
export type ShootingParams = z.infer<typeof ShootingParamsSchema>;
export type ShootingFormData = z.infer<typeof ShootingFormDataSchema>;
