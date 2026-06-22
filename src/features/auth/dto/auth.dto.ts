import { z } from 'zod';

export const profileInputSchema = z.object({
  programmingLanguages: z.array(z.string()).optional(),
  workArea: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  education: z.record(z.string(), z.unknown()).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  birthDate: z.string().datetime().optional(),
  linkedinUrl: z.string().url().optional(),
  roleCode: z.enum(['STUDENT', 'MENTOR']).default('STUDENT'),
  meta: z.record(z.string(), z.unknown()).optional(),
  profile: profileInputSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
