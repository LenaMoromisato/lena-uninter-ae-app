import { conflict, internalError } from '@core/api/api-error';
import { getAuthUserById } from '@core/api/auth-context';
import { ROLE_CODES } from '@core/constants/permissions';
import { asJsonValue } from '@core/utils/as-json-value';
import { db } from '@core/lib/db';
import { createSupabaseAdminClient } from '@core/lib/supabase-admin';
import type { RegisterInput } from '@features/auth/dto/auth.dto';
import { mapSession } from '@features/auth/utils/map-session';

export async function registerUser(input: RegisterInput) {
  const roleCode = input.roleCode === 'MENTOR' ? ROLE_CODES.MENTOR : ROLE_CODES.STUDENT;
  const role = await db.role.findUnique({ where: { code: roleCode } });

  if (!role) {
    throw internalError('Role padrao nao encontrada. Execute o seed.');
  }

  const existing = await db.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw conflict('E-mail ja cadastrado.');
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      firstName: input.firstName,
      lastName: input.lastName,
      roleCode,
    },
  });

  if (error || !data.user) {
    throw conflict(error?.message ?? 'Nao foi possivel criar usuaria no Supabase Auth.');
  }

  const user = await db.user.create({
    data: {
      supabaseAuthUserId: data.user.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      linkedinUrl: input.linkedinUrl,
      meta: asJsonValue(input.meta),
      primaryRoleId: role.id,
      profile: input.profile
        ? {
            create: {
              programmingLanguages: input.profile.programmingLanguages ?? [],
              workArea: input.profile.workArea,
              experienceYears: input.profile.experienceYears,
              education: asJsonValue(input.profile.education),
              meta: asJsonValue(input.profile.meta),
            },
          }
        : {
            create: {
              programmingLanguages: [],
            },
          },
    },
    include: {
      primaryRole: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
      profile: true,
    },
  });

  const { data: signInData, error: signInError } = await admin.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError || !signInData.session) {
    const loaded = await getAuthUserById(user.id);
    if (!loaded) {
      throw internalError('Usuaria criada mas sessao indisponivel.');
    }
    return { user: loaded, session: null };
  }

  const loaded = await getAuthUserById(user.id);

  if (!loaded) {
    throw internalError('Usuaria criada mas registro local indisponivel.');
  }

  return {
    user: loaded,
    session: signInData.session,
  };
}
