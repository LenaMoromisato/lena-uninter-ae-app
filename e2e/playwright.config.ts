import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCREENSHOT_VIEWPORT } from './helpers/screenshot-page';

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(e2eDir, '..');

loadEnv({ path: path.join(rootDir, '.env') });
loadEnv({ path: path.join(e2eDir, '.env'), override: true });

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const useExternalServer = process.env.E2E_USE_EXTERNAL_SERVER === '1';
const isUiMode = process.env.E2E_UI === '1';

export default defineConfig({
  testDir: path.join(e2eDir, 'specs'),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: isUiMode
    ? [['list']]
    : [
        ['list'],
        ['html', { outputFolder: path.join(e2eDir, 'output/report'), open: 'never' }],
      ],
  outputDir: path.join(e2eDir, 'output/test-results'),
  use: {
    baseURL,
    // UI mode gera traces internos; manter off evita ZIP truncado ao reexecutar testes.
    trace: isUiMode ? 'off' : process.env.CI ? 'on-first-retry' : 'off',
    screenshot: isUiMode ? 'off' : undefined,
    video: isUiMode ? 'off' : undefined,
    actionTimeout: process.env.CI ? 15_000 : 30_000,
    navigationTimeout: process.env.CI ? 30_000 : 45_000,
  },
  webServer: useExternalServer
    ? undefined
    : {
        // Webpack evita erro do Swagger UI com Turbopack (OpenApi3_1Element.refract).
        command: 'pnpm dev:e2e',
        url: `${baseURL}/api`,
        cwd: rootDir,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'setup',
      testMatch: '**/00-global.setup.ts',
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'off',
        video: 'off',
      },
      testIgnore: ['**/00-global.setup.ts', '**/mvp-journey.spec.ts', '**/capture-all-screenshots.spec.ts'],
    },
    {
      name: 'demo-video',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        video: 'on',
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /(mvp-journey|full-platform-tour)\.spec\.ts/,
    },
    {
      name: 'screenshots',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'on',
        video: 'off',
        viewport: SCREENSHOT_VIEWPORT,
        deviceScaleFactor: 1,
      },
      testMatch: 'capture-all-screenshots.spec.ts',
    },
  ],
});
