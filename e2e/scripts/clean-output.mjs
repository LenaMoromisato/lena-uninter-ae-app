import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(e2eDir, '..');

const targets = [
  path.join(e2eDir, 'output/test-results'),
  path.join(e2eDir, 'output/report'),
  path.join(rootDir, 'playwright-report'),
  path.join(rootDir, 'test-results'),
  path.join(rootDir, 'blob-report'),
];

for (const target of targets) {
  try {
    rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${path.relative(rootDir, target)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Could not remove ${path.relative(rootDir, target)}: ${message}`);
    console.warn('Feche o Playwright UI e rode `pnpm e2e:clean` novamente.');
  }
}
