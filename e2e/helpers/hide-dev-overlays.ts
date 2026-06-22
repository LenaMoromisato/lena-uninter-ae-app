import type { Page } from '@playwright/test';

const HIDE_DEV_UI_CSS = `
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  #__next-build-watcher {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
`;

/** Remove badge/overlay do Next.js antes de capturas (dev server). */
export async function hideDevOverlays(page: Page) {
  await page.addStyleTag({ content: HIDE_DEV_UI_CSS });

  const devTools = page.getByRole('button', { name: /Next\.js Dev Tools/i });
  if (await devTools.count()) {
    await devTools.evaluate((button) => {
      let root: Element | null = button;
      while (root?.parentElement && root.parentElement.tagName !== 'BODY') {
        root = root.parentElement;
      }
      root?.remove();
    });
  }

  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach((node) => node.remove());
  });
}
