import type { PermissionCode } from '@core/constants/permissions';

export const ADMIN_AREA_PERMISSIONS = [
  'roles.read',
  'users.read',
  'users.write',
  'users.manage',
] as const satisfies readonly PermissionCode[];
