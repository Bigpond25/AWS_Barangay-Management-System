import { z } from 'zod';

export const LuponPartySchema = z.object({
  id: z.number().optional(),
  lupon_case_id: z.number().optional(),
  type: z.enum(['complainant', 'respondent']),
  name: z.string().max(255),
  address_line1: z.string().max(255).nullable().optional(),
  address_line2: z.string().max(255).nullable().optional(),
  address_line3: z.string().max(255).nullable().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable().optional(),
});

export const LuponHearingSchema = z.object({
  id: z.number().optional(),
  lupon_case_id: z.number().optional(),
  sequence_no: z.number().nullable().optional(),
  notice_date: z.string().nullable().optional(), // ISO date
  hearing_date: z.string().nullable().optional(), // ISO date
  hearing_time: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  proceedings: z.string().nullable().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable().optional(),
});

export const LuponCaseSchema = z.object({
  id: z.number(),
  case_no: z.string().nullable().optional(),
  case_type: z.string().nullable().optional(),
  date_filed: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable().optional(),

  // Relations
  parties: z.array(LuponPartySchema).optional(),
  hearings: z.array(LuponHearingSchema).optional(),
});

export const LuponCaseParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
});

export const LuponCaseFormDataSchema = LuponCaseSchema.omit({
  id: true,
});

export type LuponParty = z.infer<typeof LuponPartySchema>;
export type LuponHearing = z.infer<typeof LuponHearingSchema>;
export type LuponCase = z.infer<typeof LuponCaseSchema>;
export type LuponCaseParams = z.infer<typeof LuponCaseParamsSchema>;
export type LuponCaseFormData = z.infer<typeof LuponCaseFormDataSchema>;
