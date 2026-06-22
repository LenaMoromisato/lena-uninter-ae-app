import type { NextRequest } from 'next/server';

import { unauthorized } from '@core/api/api-error';
import { db } from '@core/lib/db';
import { createSupabaseAuthClient } from '@core/lib/supabase-auth';

const userInclude = {
  primaryRole: {
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  },
  profile: true,
} as const;

export type AuthUser = Awaited<ReturnType<typeof loadAuthUser>>;

export type AuthContext = {
  accessToken: string;
  user: NonNullable<AuthUser>;
  permissionCodes: string[];
  hasPermission: (code: string) => boolean;
};

function extractBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim() || null;
}

async function loadAuthUser(supabaseAuthUserId: string) {
  return db.user.findUnique({
    where: { supabaseAuthUserId },
    include: userInclude,
  });
}

export async function resolveAuthContext(request: NextRequest): Promise<AuthContext> {
  const accessToken = extractBearerToken(request);

  if (!accessToken) {
    throw unauthorized();
  }

  const supabase = createSupabaseAuthClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw unauthorized();
  }

  const user = await loadAuthUser(data.user.id);

  if (!user) {
    throw unauthorized('Usuaria autenticada sem registro local.');
  }

  const permissionCodes = user.primaryRole.rolePermissions.map(
    (rp) => rp.permission.code
  );

  return {
    accessToken,
    user,
    permissionCodes,
    hasPermission: (code: string) => permissionCodes.includes(code),
  };
}

export function requirePermissions(ctx: AuthContext, permissions: string[]) {
  const missing = permissions.filter((code) => !ctx.hasPermission(code));

  if (missing.length > 0) {
    throw unauthorized();
  }
}

export async function getAuthUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });
}
