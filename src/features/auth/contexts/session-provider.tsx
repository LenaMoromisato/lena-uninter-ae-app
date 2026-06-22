'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setRefreshHandler } from '@core/api/api-client';
import { login as loginApi, logout as logoutApi, refreshSession, register as registerApi } from '@features/auth/api/auth';
import type { LoginInput, RegisterInput } from '@features/auth/dto/auth.dto';
import type { Session } from '@features/auth/models/session';
import { clearSession, loadSession, saveSession } from '@features/auth/stores/session-store';

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<Session>;
  register: (input: RegisterInput) => Promise<Session>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((next: Session | null) => {
    if (next) {
      saveSession(next);
    } else {
      clearSession();
    }
    setSessionState(next);
  }, []);

  useEffect(() => {
    setSessionState(loadSession());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const current = loadSession();
    if (!current?.refreshToken) {
      setSession(null);
      return null;
    }

    try {
      const next = await refreshSession(current.refreshToken);
      setSession(next);
      return next;
    } catch {
      setSession(null);
      return null;
    }
  }, [setSession]);

  useEffect(() => {
    setRefreshHandler(refresh);
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      const next = await loginApi(input);
      setSession(next);
      return next;
    },
    [setSession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const next = await registerApi(input);
      setSession(next);
      return next;
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    const current = loadSession();
    if (current) {
      try {
        await logoutApi(current.accessToken, current.refreshToken);
      } catch {
        // ignore logout errors
      }
    }
    setSession(null);
  }, [setSession]);

  const value = useMemo(
    () => ({ session, isLoading, login, register, logout, setSession }),
    [session, isLoading, login, register, logout, setSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider.');
  }
  return context;
}
