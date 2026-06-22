import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const e2eDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootDir = path.resolve(e2eDir, '..');
const testResultsDir = path.join(e2eDir, 'output/test-results');
const videosDir = path.join(e2eDir, 'output/videos');

function findLatestVideo(dir) {
  /** @type {{ file: string; mtime: number } | null} */
  let latest = null;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = findLatestVideo(fullPath);
      if (nested) {
        const mtime = statSync(nested).mtimeMs;
        if (!latest || mtime > latest.mtime) {
          latest = { file: nested, mtime };
        }
      }
      continue;
    }

    if (entry.isFile() && entry.name === 'video.webm') {
      const mtime = statSync(fullPath).mtimeMs;
      if (!latest || mtime > latest.mtime) {
        latest = { file: fullPath, mtime };
      }
    }
  }

  return latest?.file ?? null;
}

mkdirSync(videosDir, { recursive: true });

const source = findLatestVideo(testResultsDir);
if (!source) {
  console.error('Nenhum video.webm encontrado em e2e/output/test-results/. Rode pnpm e2e:video antes.');
  process.exit(1);
}

const targetName = process.argv[2] ?? 'platform-tour.webm';
const target = path.join(videosDir, targetName);

copyFileSync(source, target);
console.log(`Video copiado para ${path.relative(rootDir, target)}`);
