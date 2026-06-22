import type { Page } from '@playwright/test';
import { getBaseUrl } from './env';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

function getRouteApiPatterns(pathname: string): RegExp[] {
  if (pathname === '/app/descobrir') {
    return [/\/api\/v1\/users\?/];
  }

  if (pathname === '/admin/roles') {
    return [/\/api\/v1\/rbac\/roles\?/];
  }

  if (pathname === '/admin/roles/nova') {
    return [/\/api\/v1\/rbac\/permissions(\?|$)/];
  }

  if (/^\/admin\/roles\/[^/]+$/.test(pathname)) {
    const roleId = pathname.split('/').pop()!;
    return [
      new RegExp(`/api/v1/rbac/roles/${roleId}(\\?|$)`),
      /\/api\/v1\/rbac\/permissions(\?|$)/,
    ];
  }

  if (pathname === '/admin/usuarias') {
    return [/\/api\/v1\/users\?/];
  }

  if (/^\/admin\/usuarias\/[^/]+$/.test(pathname) && pathname !== '/admin/usuarias/nova') {
    const userId = pathname.split('/').pop()!;
    return [
      new RegExp(`/api/v1/users/${userId}(\\?|$)`),
      /\/api\/v1\/rbac\/roles\?/,
    ];
  }

  return [];
}

function startRouteApiWaits(page: Page, pathname: string) {
  const patterns = getRouteApiPatterns(pathname);

  return patterns.map((pattern) =>
    page
      .waitForResponse((response) => pattern.test(response.url()) && response.ok(), {
        timeout: 30_000,
      })
      .catch(() => undefined)
  );
}

async function waitForPageQuiet(page: Page, extraMs = 350) {
  await page.waitForFunction(
    () => {
      if (document.querySelector('.min-h-screen.items-center [data-slot="skeleton"]')) {
        return false;
      }

      if (document.body.textContent?.includes('Carregando...')) {
        return false;
      }

      return true;
    },
    undefined,
    { timeout: 30_000, polling: 150 }
  );

  await page.waitForTimeout(extraMs);
}

async function waitForPageSettled(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30_000 });
  await page.waitForTimeout(400);
}

/** Aguarda hidratação do App Router e guards de sessão antes de interagir. */
export async function waitForRouteSettled(page: Page) {
  const timeout = 30_000;

  await page.waitForFunction(
    () => {
      if (document.querySelector('.min-h-screen.items-center [data-slot="skeleton"]')) {
        return false;
      }

      const h1 = document.querySelector('h1');
      if (h1) {
        return true;
      }

      return document.querySelectorAll('main').length > 0;
    },
    undefined,
    { timeout, polling: 100 }
  );

  await page.locator('h1, main').first().waitFor({ state: 'visible', timeout });

  if (page.url().includes('/app') || page.url().includes('/admin')) {
    await waitForPageSettled(page);
  }

  if (page.url().includes('/entrar')) {
    throw new Error(
      `Sessao invalida — redirecionou para /entrar. Confira e2e/.auth/*.json e use E2E_BASE_URL=${getBaseUrl()}.`
    );
  }
}

export async function navigateForEvidence(page: Page, url: string) {
  const baseURL = getBaseUrl().replace(/\/$/, '');
  const pathname = url.startsWith('http') ? new URL(url).pathname : url;
  const apiWaits =
    pathname.startsWith('/admin') || pathname.startsWith('/app')
      ? startRouteApiWaits(page, pathname)
      : [];

  try {
    await page.goto(url.startsWith('http') ? url : `${baseURL}${url}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('ERR_ABORTED')) {
      throw error;
    }
    await page.waitForLoadState('domcontentloaded');
  }

  if (url.includes('/app') || url.includes('/admin')) {
    await waitForRouteSettled(page);
    await Promise.all(apiWaits);
    await waitForPageQuiet(page, url.includes('/admin') ? 600 : 450);
  }
}

export async function gotoAndSettle(page: Page, url: string) {
  await navigateForEvidence(page, url);

  if (page.url().includes('/entrar') && !url.includes('/entrar')) {
    throw new Error(`Navegacao bloqueada — redirecionou para /entrar ao acessar ${url}`);
  }
}

export async function waitForSwagger(page: Page) {
  await page.waitForSelector('.swagger-ui', { timeout: 30_000 });
}
