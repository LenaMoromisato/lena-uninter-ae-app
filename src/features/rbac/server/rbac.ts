import { conflict, forbidden, notFound } from '@core/api/api-error';
import { buildPaginationMeta, parsePagination } from '@core/api/pagination';
import { toIsoString } from '@core/utils/to-iso-string';
import { db } from '@core/lib/db';
import type { CreateRoleInput, UpdateRoleInput } from '@features/rbac/dto/rbac.dto';

function mapRole(role: Awaited<ReturnType<typeof getRoleWithRelations>>) {
  return {
    id: role.id,
    code: role.code,
    label: role.label,
    description: role.description,
    isSystem: role.isSystem,
    permissionCodes: role.rolePermissions.map((rp) => rp.permission.code),
    permissions: role.rolePermissions.map((rp) => ({
      code: rp.permission.code,
      label: rp.permission.label,
      resource: rp.permission.resource,
      action: rp.permission.action,
    })),
    userCount: role._count.users,
    createdAt: toIsoString(role.createdAt),
    updatedAt: toIsoString(role.updatedAt),
  };
}

async function getRoleWithRelations(roleId: string) {
  return db.role.findUniqueOrThrow({
    where: { id: roleId },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });
}

export async function listRoles(searchParams: URLSearchParams) {
  const pagination = parsePagination(searchParams);
  const [total, roles] = await Promise.all([
    db.role.count(),
    db.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { code: 'asc' },
    }),
  ]);

  return {
    items: roles.map(mapRole),
    meta: buildPaginationMeta(total, pagination),
  };
}

export async function getRole(roleId: string) {
  try {
    const role = await getRoleWithRelations(roleId);
    return mapRole(role);
  } catch {
    throw notFound('Role nao encontrada.');
  }
}

export async function createRole(input: CreateRoleInput) {
  const existing = await db.role.findUnique({ where: { code: input.code } });

  if (existing) {
    throw conflict('Codigo de role ja existe.');
  }

  const permissions = await db.permission.findMany({
    where: { code: { in: input.permissionCodes } },
  });

  const role = await db.role.create({
    data: {
      code: input.code,
      label: input.label,
      description: input.description,
      isSystem: false,
      rolePermissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id,
        })),
      },
    },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  return mapRole(role);
}

export async function updateRole(roleId: string, input: UpdateRoleInput) {
  const role = await db.role.findUnique({ where: { id: roleId } });

  if (!role) {
    throw notFound('Role nao encontrada.');
  }

  if (input.permissionCodes) {
    const permissions = await db.permission.findMany({
      where: { code: { in: input.permissionCodes } },
    });

    await db.rolePermission.deleteMany({ where: { roleId } });
    await db.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
      })),
    });
  }

  const updated = await db.role.update({
    where: { id: roleId },
    data: {
      label: input.label,
      description: input.description === null ? null : input.description,
    },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  return mapRole(updated);
}

export async function deleteRole(roleId: string) {
  const role = await db.role.findUnique({ where: { id: roleId } });

  if (!role) {
    throw notFound('Role nao encontrada.');
  }

  if (role.isSystem) {
    throw forbidden('Roles de sistema nao podem ser removidas.');
  }

  const usersCount = await db.user.count({ where: { primaryRoleId: roleId } });

  if (usersCount > 0) {
    throw conflict('Role possui usuarias vinculadas.');
  }

  await db.role.delete({ where: { id: roleId } });
  return { id: roleId, deleted: true };
}

export async function listPermissions() {
  const permissions = await db.permission.findMany({ orderBy: { code: 'asc' } });

  return permissions.map((permission) => ({
    code: permission.code,
    resource: permission.resource,
    action: permission.action,
    label: permission.label,
    description: permission.description,
    isSystem: permission.isSystem,
  }));
}

export async function getRbacMatrix() {
  const [permissions, roles] = await Promise.all([
    listPermissions(),
    db.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { code: 'asc' },
    }),
  ]);

  return {
    permissions,
    roles: roles.map(mapRole),
  };
}
