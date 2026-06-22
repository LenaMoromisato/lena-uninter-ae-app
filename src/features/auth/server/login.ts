import { unauthorized, internalError } from '@core/api/api-error';
import { getAuthUserById } from '@core/api/auth-context';
import { db } from '@core/lib/db';
import { createSupabaseAuthClient } from '@core/lib/supabase-auth';
import type { LoginInput } from '@features/auth/dto/auth.dto';

export async function loginUser(input: LoginInput) {
  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw unauthorized('Credenciais invalidas.');
  }

  const user = await db.user.findUnique({
    where: { supabaseAuthUserId: data.user.id },
    include: {
      primaryRole: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
      profile: true,
    },
  });

  if (!user) {
    throw unauthorized('Usuaria autenticada sem registro local.');
  }

  return { user, session: data.session };
}

export async function refreshSession(refreshToken: string) {
  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session || !data.user) {
    throw unauthorized('Refresh token invalido ou expirado.');
  }

  const user = await getAuthUserById(
    (
      await db.user.findUniqueOrThrow({
        where: { supabaseAuthUserId: data.user.id },
        select: { id: true },
      })
    ).id
  );

  if (!user) {
    throw internalError('Sessao renovada mas usuario local indisponivel.');
  }

  return { user, session: data.session };
}

export async function logoutUser(accessToken: string) {
  const supabase = createSupabaseAuthClient(accessToken);
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw unauthorized(error.message);
  }

  return { success: true };
}
