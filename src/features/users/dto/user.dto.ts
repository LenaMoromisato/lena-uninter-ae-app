import { z } from 'zod';

import { profileInputSchema } from '@features/auth/dto/auth.dto';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  birthDate: z.string().datetime().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  meta: z.record(z.string(), z.unknown()).optional(),
  profile: profileInputSchema.optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
  workArea: z.string().optional(),
  roleCode: z.string().optional(),
  programmingLanguages: z.string().optional(),
});

export const updateUserAdminSchema = z.object({
  primaryRoleId: z.string().uuid().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
