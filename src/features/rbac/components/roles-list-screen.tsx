'use client';

import { listRoles } from '@features/rbac/api/rbac';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent } from '@shadcn/ui/card';
import { Skeleton } from '@shadcn/ui/skeleton';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';

export function RolesListScreen() {
  const { session } = useSession();
  const canCreate = hasPermission(session?.user.permissionCodes ?? [], 'roles.write');

  const { data: result, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listRoles(session!.accessToken),
  });

  const roles = result?.data ?? [];

  return (
    <PermissionGuard permissions="roles.read">
      <div>
        <PageHeader
          title="Papeis"
          description="Gerencie os papeis e permissoes do sistema."
          actions={
            canCreate ? (
              <Button asChild>
                <NavLink href="/admin/roles/nova">Novo papel</NavLink>
              </Button>
            ) : null
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : roles.length === 0 ? (
          <EmptyState
            title="Nenhum papel encontrado"
            description="Crie o primeiro papel customizado para comecar."
          />
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{role.label}</p>
                      <Badge variant="outline">{role.code}</Badge>
                      {role.isSystem ? <Badge>Sistema</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description ?? 'Sem descricao'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissionCodes.length} permissoes · {role.userCount} usuarias
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <NavLink href={`/admin/roles/${role.id}`}>Editar</NavLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
