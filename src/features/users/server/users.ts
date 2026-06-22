import type { Prisma } from '@core/lib/prisma/client';
import { forbidden, notFound } from '@core/api/api-error';
import { buildPaginationMeta, parsePagination } from '@core/api/pagination';
import { ROLE_CODES } from '@core/constants/permissions';
import { asJsonValue } from '@core/utils/as-json-value';
import { db } from '@core/lib/db';
import type {
  ListUsersQuery,
  UpdateProfileInput,
  UpdateUserAdminInput,
} from '@features/users/dto/user.dto';
import { mapUserResponse } from '@features/users/utils/map-user';

const userInclude = {
  primaryRole: {
    include: {
      rolePermissions: { include: { permission: true } },
    },
  },
  profile: true,
} as const;

export async function getMe(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });

  if (!user) {
    throw notFound('Usuaria nao encontrada.');
  }

  return mapUserResponse(user);
}

export async function getUserById(userId: string) {
  return getMe(userId);
}

export async function updateMe(userId: string, input: UpdateProfileInput) {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw notFound('Usuaria nao encontrada.');
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate:
        input.birthDate === null
          ? null
          : input.birthDate
            ? new Date(input.birthDate)
            : undefined,
      linkedinUrl: input.linkedinUrl === null ? null : input.linkedinUrl,
      meta: asJsonValue(input.meta),
      profile: input.profile
        ? {
            upsert: {
              create: {
                programmingLanguages: input.profile.programmingLanguages ?? [],
                workArea: input.profile.workArea,
                experienceYears: input.profile.experienceYears,
                education: asJsonValue(input.profile.education),
                meta: asJsonValue(input.profile.meta),
              },
              update: {
                programmingLanguages: input.profile.programmingLanguages,
                workArea: input.profile.workArea,
                experienceYears: input.profile.experienceYears,
                education: asJsonValue(input.profile.education),
                meta: asJsonValue(input.profile.meta),
              },
            },
          }
        : undefined,
    },
    include: userInclude,
  });

  return mapUserResponse(updated);
}

export async function listUsers(query: ListUsersQuery) {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.set('page', String(query.page));
  if (query.limit) searchParams.set('limit', String(query.limit));

  const pagination = parsePagination(searchParams);
  const where: Prisma.UserWhereInput = {};

  if (query.q) {
    where.OR = [
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.workArea) {
    where.profile = { workArea: { contains: query.workArea, mode: 'insensitive' } };
  }

  if (query.roleCode) {
    where.primaryRole = { code: query.roleCode };
  }

  if (query.programmingLanguages) {
    const langs = query.programmingLanguages.split(',').map((s) => s.trim()).filter(Boolean);
    if (langs.length > 0) {
      where.profile = {
        ...(where.profile as Prisma.UserProfileWhereInput),
        programmingLanguages: { hasSome: langs },
      };
    }
  }

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      include: userInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    items: users.map(mapUserResponse),
    meta: buildPaginationMeta(total, pagination),
  };
}

export async function provisionUser(input: Parameters<typeof import('@features/auth/server/register').registerUser>[0]) {
  const { registerUser } = await import('@features/auth/server/register');
  const result = await registerUser(input);
  return result.user ? mapUserResponse(result.user) : null;
}

type UpdateUserAdminAuth = {
  userId: string;
  hasPermission: (code: string) => boolean;
};

export async function updateUserAdmin(
  userId: string,
  input: UpdateUserAdminInput,
  auth: UpdateUserAdminAuth
) {
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    include: { primaryRole: true },
  });

  if (!targetUser) {
    throw notFound('Usuaria nao encontrada.');
  }

  if (input.primaryRoleId === undefined) {
    return getUserById(userId);
  }

  if (!auth.hasPermission('users.update')) {
    throw forbidden('Sem permissao para atualizar usuarias.');
  }

  const newRole = await db.role.findUnique({ where: { id: input.primaryRoleId } });

  if (!newRole) {
    throw notFound('Role nao encontrada.');
  }

  const isSuperAdminRole = newRole.code === ROLE_CODES.SUPER_ADMIN;
  const wasSuperAdmin = targetUser.primaryRole.code === ROLE_CODES.SUPER_ADMIN;

  if (isSuperAdminRole && !auth.hasPermission('users.manage')) {
    throw forbidden('Sem permissao para atribuir SUPER_ADMIN.');
  }

  if (wasSuperAdmin && !isSuperAdminRole) {
    const superAdminRole = await db.role.findUnique({
      where: { code: ROLE_CODES.SUPER_ADMIN },
    });

    if (superAdminRole) {
      const superAdminCount = await db.user.count({
        where: { primaryRoleId: superAdminRole.id },
      });

      if (superAdminCount <= 1) {
        throw forbidden('Nao e possivel remover o ultimo SUPER_ADMIN do sistema.');
      }
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { primaryRoleId: input.primaryRoleId },
  });

  return getUserById(userId);
}
