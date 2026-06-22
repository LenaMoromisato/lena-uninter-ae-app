import { apiFetch } from '@core/api/api-client';
import type { CreateRoleInput, UpdateRoleInput } from '@features/rbac/dto/rbac.dto';

export type PermissionResponse = {
  code: string;
  resource: string;
  action: string;
  label: string;
  description: string | null;
  isSystem: boolean;
};

export type RoleResponse = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  permissionCodes: string[];
  permissions: Array<{
    code: string;
    label: string;
    resource: string;
    action: string;
  }>;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RbacMatrixResponse = {
  permissions: PermissionResponse[];
  roles: RoleResponse[];
};

export async function listRoles(token: string, page = 1, limit = 50) {
  return apiFetch<RoleResponse[]>('/rbac/roles', {
    token,
    searchParams: { page, limit },
  });
}

export async function getRole(token: string, roleId: string) {
  const result = await apiFetch<RoleResponse>(`/rbac/roles/${roleId}`, { token });
  return result.data;
}

export async function createRole(token: string, input: CreateRoleInput) {
  const result = await apiFetch<RoleResponse>('/rbac/roles', {
    method: 'POST',
    body: input,
    token,
  });
  return result.data;
}

export async function updateRole(token: string, roleId: string, input: UpdateRoleInput) {
  const result = await apiFetch<RoleResponse>(`/rbac/roles/${roleId}`, {
    method: 'PATCH',
    body: input,
    token,
  });
  return result.data;
}

export async function deleteRole(token: string, roleId: string) {
  const result = await apiFetch<{ id: string; deleted: boolean }>(`/rbac/roles/${roleId}`, {
    method: 'DELETE',
    token,
  });
  return result.data;
}

export async function listPermissions(token: string) {
  const result = await apiFetch<PermissionResponse[]>('/rbac/permissions', { token });
  return result.data;
}

export async function getMatrix(token: string) {
  const result = await apiFetch<RbacMatrixResponse>('/rbac/matrix', { token });
  return result.data;
}
