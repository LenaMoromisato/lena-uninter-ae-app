import type { SessionPayload } from '../seed/types';
import { getBaseUrl } from './env';

export async function apiFetch<T>(
  path: string,
  session: SessionPayload,
  init?: RequestInit
): Promise<T> {
  const baseURL = getBaseUrl();
  const response = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${path} failed: ${response.status} ${body}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

export async function fetchOpenApiSpec() {
  const baseURL = getBaseUrl();
  const response = await fetch(`${baseURL}/api/v1/openapi.json`);
  if (!response.ok) {
    throw new Error(`OpenAPI fetch failed: ${response.status}`);
  }
  return response.json() as Promise<{ paths: Record<string, unknown> }>;
}

export async function fetchApiIndex() {
  const baseURL = getBaseUrl();
  const response = await fetch(`${baseURL}/api`);
  if (!response.ok) {
    throw new Error(`API index fetch failed: ${response.status}`);
  }
  return response.json();
}
