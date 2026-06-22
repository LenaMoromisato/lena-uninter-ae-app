import { ADMIN_AREA_PERMISSIONS } from '@features/auth/constants/admin-permissions';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { AdminShell } from '@features/admin/components/admin-shell';
import type { ReactNode } from 'react';

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGuard permissions={[...ADMIN_AREA_PERMISSIONS]} mode="any">
      <AdminShell>{children}</AdminShell>
    </PermissionGuard>
  );
}
