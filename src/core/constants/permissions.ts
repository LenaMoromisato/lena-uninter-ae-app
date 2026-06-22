export const PERMISSION_CODES = [
  'users.read',
  'users.write',
  'users.update',
  'users.manage',
  'roles.read',
  'roles.write',
  'roles.update',
  'roles.manage',
  'permissions.read',
  'profiles.read',
  'profiles.update',
  'mentorship_requests.read',
  'mentorship_requests.write',
  'mentorship_requests.manage',
  'conversations.read',
  'messages.read',
  'messages.write',
  'notifications.read',
  'notifications.update',
  'events.read',
  'events.write',
  'events.update',
  'events.manage',
  'event_registrations.write',
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

export const PUBLIC_ROLE_CODES = [ROLE_CODES.STUDENT, ROLE_CODES.MENTOR] as const;
