import type { LoginInput, RegisterInput } from '@features/auth/dto/auth.dto';
import type { Session } from '@features/auth/models/session';
import { apiFetch } from '@core/api/api-client';

export async function login(input: LoginInput) {
  const result = await apiFetch<Session>('/auth/login', {
    method: 'POST',
    body: input,
  });
  return result.data;
}

export async function register(input: RegisterInput) {
  const result = await apiFetch<Session>('/auth/register', {
    method: 'POST',
    body: input,
  });
  return result.data;
}

export async function refreshSession(refreshToken: string) {
  const result = await apiFetch<Session>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
  return result.data;
}

export async function logout(accessToken: string, refreshToken: string) {
  await apiFetch<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: { accessToken, refreshToken },
    token: accessToken,
  });
}
