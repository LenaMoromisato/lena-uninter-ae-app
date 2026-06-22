'use client';

import type { PermissionCode } from '@core/constants/permissions';
import { useClientMounted } from '@core/hooks/use-client-mounted';
import { useSession } from '@features/auth/contexts/session-provider';
import {
  hasAllPermissions,
  hasAnyPermission,
} from '@features/auth/utils/has-permission';
import { authRedirect } from '@features/auth/utils/auth-redirect';
import { Skeleton } from '@shadcn/ui/skeleton';
import { useEffect, type ReactNode } from 'react';

type PermissionGuardProps = {
  permissions: PermissionCode | PermissionCode[];
  mode?: 'any' | 'all';
  fallbackHref?: string;
  children: ReactNode;
};

export function PermissionGuard({
  permissions,
  mode = 'any',
  fallbackHref = '/admin/sem-permissao',
  children,
}: PermissionGuardProps) {
  const { session, isLoading } = useSession();
  const mounted = useClientMounted();
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const permissionCodes = session?.user.permissionCodes ?? [];

  const allowed =
    mode === 'all'
      ? hasAllPermissions(permissionCodes, required)
      : hasAnyPermission(permissionCodes, required);

  useEffect(() => {
    if (!mounted || isLoading || !session || allowed) {
      return;
    }

    authRedirect(fallbackHref);
  }, [allowed, fallbackHref, isLoading, mounted, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!session || !allowed) {
    return null;
  }

  return children;
}
