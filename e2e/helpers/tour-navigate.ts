import type { Page } from '@playwright/test';
import { hideDevOverlays } from './hide-dev-overlays';
import { navigateForEvidence } from './wait-for-app';

const DEFAULT_PAUSE_MS = 1_200;

/** Navega para a rota, estabiliza guards e pausa para o gravador capturar a tela. */
export async function tourScene(page: Page, route: string, pauseMs = DEFAULT_PAUSE_MS) {
  const currentPath = new URL(page.url()).pathname;
  if (currentPath !== route) {
    await navigateForEvidence(page, route);
  } else if (route.includes('/app') || route.includes('/admin')) {
    await page.locator('h1, main').first().waitFor({ state: 'visible', timeout: 45_000 });
    await page.waitForTimeout(350);
  }

  await hideDevOverlays(page);
  await page.waitForTimeout(pauseMs);
}
