import type { ListUsersQuery, UpdateProfileInput, UpdateUserAdminInput } from '@features/users/dto/user.dto';
import type { SessionUser } from '@features/auth/models/session';
import { apiFetch } from '@core/api/api-client';
import type { RegisterInput } from '@features/auth/dto/auth.dto';

export async function getMe(token: string) {
  const result = await apiFetch<SessionUser>('/users/me', { token });
  return result.data;
}

export async function updateMe(token: string, input: UpdateProfileInput) {
  const result = await apiFetch<SessionUser>('/users/me', {
    method: 'PATCH',
    body: input,
    token,
  });
  return result.data;
}

export async function listUsers(token: string, query: ListUsersQuery = {}) {
  return apiFetch<SessionUser[]>('/users', {
    token,
    searchParams: query,
  });
}

export async function getUserById(token: string, userId: string) {
  const result = await apiFetch<SessionUser>(`/users/${userId}`, { token });
  return result.data;
}

export async function updateUser(token: string, userId: string, input: UpdateUserAdminInput) {
  const result = await apiFetch<SessionUser>(`/users/${userId}`, {
    method: 'PATCH',
    body: input,
    token,
  });
  return result.data;
}

export async function provisionUser(token: string, input: RegisterInput) {
  const result = await apiFetch<SessionUser>('/users', {
    method: 'POST',
    body: input,
    token,
  });
  return result.data;
}
