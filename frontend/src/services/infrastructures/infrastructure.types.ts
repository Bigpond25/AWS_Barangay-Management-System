import { z } from 'zod';

export const InfrastructureSchema = z.object({
  id: z.number(),

  date_of_application: z.string().nullable().optional(), // ISO date or null
  type_of_project: z.string().nullable().optional(),
  classification: z.string().nullable().optional(),
  name_of_applicant: z.string().max(1000).nullable().optional(),
  address_of_applicant: z.string().max(1000).nullable().optional(),
  applicant_contact_no: z.string().max(1000).nullable().optional(),
  applicants_representative: z.string().max(1000).nullable().optional(),
  location_of_project: z.string().max(1000).nullable().optional(),
  property_owner: z.string().max(1000).nullable().optional(),
  contractor: z.string().max(1000).nullable().optional(),
  contractors_address: z.string().max(1000).nullable().optional(),
  contractors_contact_person: z.string().max(1000).nullable().optional(),
  contractors_contact_no: z.string().max(1000).nullable().optional(),
  remarks_on_clearance: z.string().nullable().optional(),
  remarks_hidden: z.string().nullable().optional(),
  bond_amount_words: z.string().max(1000).nullable().optional(),
  bond_amount_figure: z.number().nullable().optional(),

  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable().optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const InfrastructureParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
});

export const InfrastructureFormDataSchema = InfrastructureSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Infrastructure = z.infer<typeof InfrastructureSchema>;
export type InfrastructureParams = z.infer<typeof InfrastructureParamsSchema>;
export type InfrastructureFormData = z.infer<typeof InfrastructureFormDataSchema>;
