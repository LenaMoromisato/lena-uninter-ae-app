import { test as base, type Page } from '@playwright/test';
import { loadSeedState } from '../helpers/env';
import { gotoAndSettle } from '../helpers/wait-for-app';

const KNOWN_BENIGN_PAGE_ERRORS = [
  'OpenApi3_1Element.refract is not a function',
  'Router action dispatched before initialization',
];

function attachBenignErrorFilters(page: Page) {
  page.on('pageerror', (error) => {
    if (KNOWN_BENIGN_PAGE_ERRORS.some((snippet) => error.message.includes(snippet))) {
      return;
    }
  });
}

export const test = base.extend<{
  seedState: ReturnType<typeof loadSeedState>;
  gotoSettled: (url: string) => Promise<void>;
}>({
  page: async ({ page }, use) => {
    attachBenignErrorFilters(page);
    await use(page);
  },

  gotoSettled: async ({ page }, use) => {
    await use((url: string) => gotoAndSettle(page, url));
  },

  seedState: async ({}, use) => {
    await use(loadSeedState());
  },
});

export { expect } from '@playwright/test';
