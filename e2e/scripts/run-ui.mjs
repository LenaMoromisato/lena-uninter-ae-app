import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(e2eDir, '..');

const includeAll = process.argv.includes('--all');
const projects = includeAll
  ? ['setup', 'chromium', 'demo-video', 'screenshots']
  : ['setup', 'chromium'];

console.log('Limpando artefatos E2E anteriores...');
const clean = spawnSync(process.execPath, [path.join(e2eDir, 'scripts/clean-output.mjs')], {
  cwd: rootDir,
  stdio: 'inherit',
});

if (clean.status !== 0) {
  process.exit(clean.status ?? 1);
}

const playwrightArgs = [
  'exec',
  'playwright',
  'test',
  '-c',
  'e2e/playwright.config.ts',
  '--ui',
  ...projects.flatMap((project) => ['--project', project]),
];

console.log('Iniciando Playwright UI (trace websocket frames desativados)...');

const run = spawnSync('pnpm', playwrightArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    E2E_UI: '1',
    // Evita ZIP de trace truncado no UI mode (playwright#41351, playwright#37887).
    PLAYWRIGHT_TRACING_NO_WEBSOCKET_FRAMES: '1',
  },
});

process.exit(run.status ?? 1);
