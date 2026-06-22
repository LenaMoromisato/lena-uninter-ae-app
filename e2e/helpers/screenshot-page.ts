import type { Page } from '@playwright/test';
import path from 'node:path';
import { hideDevOverlays } from './hide-dev-overlays';

const OUTPUT_DIR = path.join(process.cwd(), 'e2e/output/screenshots');

export const SCREENSHOT_VIEWPORT = { width: 1920, height: 1080 } as const;

export async function screenshotPage(page: Page, slug: string) {
  await page.setViewportSize(SCREENSHOT_VIEWPORT);
  await hideDevOverlays(page);
  await page.waitForTimeout(200);

  const filePath = path.join(OUTPUT_DIR, `${slug}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

export function screenshotSlug(group: string, route: string) {
  return `${group}__${route.replace(/\//g, '_').replace(/^_/, '') || 'root'}`;
}
