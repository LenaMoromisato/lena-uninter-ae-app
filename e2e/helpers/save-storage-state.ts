import { writeFileSync } from 'node:fs';
import type { SessionPayload } from '../seed/types';
import { getStorageKey, getStorageOrigins } from './env';

export function buildStorageState(session: SessionPayload) {
  const storageEntry = {
    name: getStorageKey(),
    value: JSON.stringify(session),
  };

  return {
    cookies: [],
    origins: getStorageOrigins().map((origin) => ({
      origin,
      localStorage: [storageEntry],
    })),
  };
}

export function saveStorageStateFromSession(session: SessionPayload, filePath: string) {
  writeFileSync(filePath, `${JSON.stringify(buildStorageState(session), null, 2)}\n`, 'utf8');
}
