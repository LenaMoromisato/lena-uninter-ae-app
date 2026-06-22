import type { Page } from '@playwright/test';
import type { SessionPayload } from '../seed/types';
import { getBaseUrl, getStorageKey } from './env';
import { waitForRouteSettled } from './wait-for-app';
import { waitForServerReady } from './wait-for-server';

export async function loginViaApi(email: string, password: string): Promise<SessionPayload> {
  const baseURL = getBaseUrl();
  await waitForServerReady(baseURL);

  const response = await fetch(`${baseURL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Login failed for ${email}: ${response.status} ${body}`);
  }

  const json = (await response.json()) as { data: SessionPayload };
  return json.data;
}

export async function clearClientSession(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/** Grava sessao no localStorage e navega — passa por /entrar ao trocar de papel. */
export async function applySession(page: Page, session: SessionPayload, landingPath = '/app') {
  const storageKey = getStorageKey();
  const baseURL = getBaseUrl().replace(/\/$/, '');
  const currentPath = page.url().startsWith(baseURL) ? new URL(page.url()).pathname : '';

  // Troca de sessao com pagina autenticada montada dispara router.replace nos guards.
  const needsNeutralPage =
    currentPath.startsWith('/app') ||
    currentPath.startsWith('/admin') ||
    !page.url().startsWith(baseURL);

  if (needsNeutralPage) {
    await page.goto(`${baseURL}/entrar`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  }

  await page.evaluate(
    ({ key, val }) => {
      localStorage.setItem(key, val);
    },
    { key: storageKey, val: JSON.stringify(session) }
  );

  try {
    await page.goto(`${baseURL}${landingPath}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('ERR_ABORTED')) {
      throw error;
    }
    await page.waitForLoadState('domcontentloaded');
  }

  if (landingPath.includes('/app') || landingPath.includes('/admin')) {
    await waitForRouteSettled(page);
  }

  if (page.url().includes('/entrar') && !landingPath.includes('/entrar')) {
    throw new Error(
      `Sessao E2E nao aplicada (chave ${storageKey}). Use pnpm dev:e2e e confira NEXT_PUBLIC_COOKIE_PREFIX.`
    );
  }
}

/** @deprecated Use applySession */
export async function injectSession(page: Page, session: SessionPayload) {
  await applySession(page, session, '/app');
}

export async function loginAs(
  page: Page,
  email: string,
  password: string,
  landingPath = '/app'
) {
  const session = await loginViaApi(email, password);
  await applySession(page, session, landingPath);
  return session;
}

export async function registerViaApi(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleCode: 'STUDENT' | 'MENTOR';
  profile?: { workArea?: string; programmingLanguages?: string[] };
}) {
  const baseURL = getBaseUrl();
  await waitForServerReady(baseURL);

  const response = await fetch(`${baseURL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Register failed for ${input.email}: ${response.status} ${body}`);
  }

  const json = (await response.json()) as { data: SessionPayload };
  return json.data;
}
