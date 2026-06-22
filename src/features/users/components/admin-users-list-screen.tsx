'use client';

import { listUsers } from '@features/users/api/users';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Skeleton } from '@shadcn/ui/skeleton';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useState } from 'react';

export function AdminUsersListScreen() {
  const { session } = useSession();
  const canProvision = hasPermission(session?.user.permissionCodes ?? [], 'users.write');
  const [q, setQ] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [filters, setFilters] = useState({ q: '', roleCode: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    enabled: Boolean(session?.accessToken),
    queryFn: () =>
      listUsers(session!.accessToken, {
        ...filters,
        page: 1,
        limit: 50,
      }),
  });

  const users = data?.data ?? [];

  return (
    <PermissionGuard permissions="users.read">
      <div>
        <PageHeader
          title="Usuarias"
          description="Gerencie contas e papeis das participantes."
          actions={
            canProvision ? (
              <Button asChild>
                <NavLink href="/admin/usuarias/nova">Provisionar</NavLink>
              </Button>
            ) : null
          }
        />

        <form
          className="mb-6 grid gap-4 rounded-xl border p-4 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ q, roleCode });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="admin-q">Busca</Label>
            <Input
              id="admin-q"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Nome ou e-mail"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-role">Papel</Label>
            <Input
              id="admin-role"
              value={roleCode}
              onChange={(event) => setRoleCode(event.target.value.toUpperCase())}
              placeholder="STUDENT, MENTOR, ADMIN..."
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Filtrar
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Nenhuma usuaria encontrada"
            description="Ajuste os filtros ou provisione uma nova conta."
          />
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role.label} ({user.role.code}) · criada em{' '}
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <NavLink href={`/admin/usuarias/${user.id}`}>Detalhes</NavLink>
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
