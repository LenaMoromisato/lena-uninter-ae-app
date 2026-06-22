import { z } from 'zod';

import { PERMISSION_CODES } from '@core/constants/permissions';

const permissionCodeEnum = z.enum(PERMISSION_CODES);

export const createRoleSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  permissionCodes: z.array(permissionCodeEnum).default([]),
});

export const updateRoleSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  permissionCodes: z.array(permissionCodeEnum).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
