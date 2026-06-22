import { APP_COOKIE_PREFIX_DEFAULT, APP_STORAGE_KEY } from '@core/constants/app';
import type { Session } from '@features/auth/models/session';

function getStorageKey() {
  const prefix = process.env.NEXT_PUBLIC_COOKIE_PREFIX ?? APP_COOKIE_PREFIX_DEFAULT;
  return `${prefix}.${APP_STORAGE_KEY}`;
}

export function loadSession(): Session | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw?.trim()) {
      return null;
    }

    return JSON.parse(raw) as Session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: Session) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(getStorageKey(), JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(getStorageKey());
}
