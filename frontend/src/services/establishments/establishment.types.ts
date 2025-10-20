import { z } from 'zod';

export const EstablishmentSchema = z.object({
  id: z.number(),
  business_name: z.string().nullable(),
  room_unit: z.string().nullable(),
  building: z.string().nullable(),
  no: z.string().nullable(),
  location: z.string().nullable(),
  owner: z.string().nullable(),
  nature_of_business: z.string().nullable(),
  date_approved: z.string().nullable(),
  date_of_last_renewal: z.string().nullable(),
  remarks_on_print_business: z.string().nullable(),
  date_of_retirement: z.string().nullable(),
});

export const EstablishmentParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
});

export const EstablishmentFormDataSchema = EstablishmentSchema.omit({ id: true });

export type Establishment = z.infer<typeof EstablishmentSchema>;
export type EstablishmentParams = z.infer<typeof EstablishmentParamsSchema>;
export type EstablishmentFormData = z.infer<typeof EstablishmentFormDataSchema>;
