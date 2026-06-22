'use client';

import { useClientMounted } from '@core/hooks/use-client-mounted';
import { useSession } from '@features/auth/contexts/session-provider';
import { authRedirect } from '@features/auth/utils/auth-redirect';
import { Skeleton } from '@shadcn/ui/skeleton';
import { useEffect, type ReactNode } from 'react';

export function SessionGuard({ children }: { children: ReactNode }) {
  const { session, isLoading } = useSession();
  const mounted = useClientMounted();

  useEffect(() => {
    if (!mounted || isLoading || session) {
      return;
    }

    authRedirect('/entrar');
  }, [mounted, isLoading, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}
