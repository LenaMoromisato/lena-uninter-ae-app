import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SEED_STATE_PATH } from '../seed/seed-data';
import type { SeedState } from '../seed/types';

export function loadSeedState(): SeedState {
  const path = fileURLToPath(SEED_STATE_PATH);

  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw) as SeedState;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(
        'Arquivo e2e/.seed-state.json nao encontrado. Execute `pnpm e2e:seed` ou rode a suite sem E2E_SKIP_SEED=1.'
      );
    }
    throw error;
  }
}

export function getBaseUrl() {
  return process.env.E2E_BASE_URL ?? 'http://localhost:3000';
}

/** Origens equivalentes para localStorage (Playwright exige match exato de origin). */
export function getStorageOrigins() {
  const base = getBaseUrl().replace(/\/$/, '');
  const origins = new Set<string>([base]);

  try {
    const url = new URL(base);
    const port = url.port ? `:${url.port}` : '';

    if (url.hostname === 'localhost') {
      origins.add(`${url.protocol}//127.0.0.1${port}`);
    } else if (url.hostname === '127.0.0.1') {
      origins.add(`${url.protocol}//localhost${port}`);
    }
  } catch {
    // keep single origin
  }

  return [...origins];
}

export function getStorageKey() {
  const prefix = process.env.NEXT_PUBLIC_COOKIE_PREFIX ?? 'techsisters';
  return `${prefix}.techsisters.session`;
}
