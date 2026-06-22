import type { AuthUser } from '@core/api/auth-context';
import { toIsoString } from '@core/utils/to-iso-string';

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  tokenType: string;
  user: ReturnType<typeof mapUserResponse>;
};

export function mapUserResponse(user: NonNullable<AuthUser>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: toIsoString(user.birthDate),
    linkedinUrl: user.linkedinUrl,
    meta: user.meta,
    role: {
      id: user.primaryRole.id,
      code: user.primaryRole.code,
      label: user.primaryRole.label,
    },
    permissionCodes: user.primaryRole.rolePermissions.map(
      (rp) => rp.permission.code
    ),
    profile: user.profile
      ? {
          id: user.profile.id,
          programmingLanguages: user.profile.programmingLanguages,
          workArea: user.profile.workArea,
          experienceYears: user.profile.experienceYears,
          education: user.profile.education,
          meta: user.profile.meta,
          createdAt: toIsoString(user.profile.createdAt),
          updatedAt: toIsoString(user.profile.updatedAt),
        }
      : null,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
  };
}

export function mapSession(
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
  },
  user: NonNullable<AuthUser>
): SessionPayload {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in ?? null,
    tokenType: session.token_type ?? 'bearer',
    user: mapUserResponse(user),
  };
}
