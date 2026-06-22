'use client';

import { getUserById, updateUser } from '@features/users/api/users';
import type { RoleResponse } from '@features/rbac/api/rbac';
import { listRoles } from '@features/rbac/api/rbac';
import { ApiClientError } from '@core/api/api-client';
import { ROLE_CODES } from '@core/constants/permissions';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import type { SessionUser } from '@features/auth/models/session';
import { Button } from '@shadcn/ui/button';
import { Label } from '@shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select';
import { Skeleton } from '@shadcn/ui/skeleton';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useState } from 'react';
import { toast } from 'sonner';

type AdminUserDetailScreenProps = {
  userId: string;
};

type UserRoleEditorProps = {
  user: SessionUser;
  userId: string;
  assignableRoles: RoleResponse[];
  canUpdate: boolean;
  canManage: boolean;
};

function UserRoleEditor({
  user,
  userId,
  assignableRoles,
  canUpdate,
  canManage,
}: UserRoleEditorProps) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [primaryRoleId, setPrimaryRoleId] = useState(user.role.id);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');
      return updateUser(session.accessToken, userId, { primaryRoleId });
    },
    onSuccess: () => {
      toast.success('Papel atualizado.');
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel atualizar a usuaria.';
      toast.error(message);
    },
  });

  return (
    <div className="max-w-xl space-y-6 rounded-xl border p-6">
      <div className="space-y-1">
        <p className="text-lg font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">
          Papel atual: {user.role.label} ({user.role.code})
        </p>
      </div>

      {canUpdate ? (
        <div className="space-y-2">
          <Label htmlFor="primaryRoleId">Papel</Label>
          <Select value={primaryRoleId} onValueChange={setPrimaryRoleId}>
            <SelectTrigger id="primaryRoleId">
              <SelectValue placeholder="Selecione um papel" />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label} ({role.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!canManage ? (
            <p className="text-xs text-muted-foreground">
              Atribuir SUPER_ADMIN requer permissao users.manage.
            </p>
          ) : null}
        </div>
      ) : null}

      {canUpdate ? (
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || primaryRoleId === user.role.id}
        >
          {saveMutation.isPending ? 'Salvando...' : 'Salvar papel'}
        </Button>
      ) : null}

      <p className="text-xs text-muted-foreground">
        A usuaria precisa sair e entrar novamente para ver as permissoes atualizadas.
      </p>
    </div>
  );
}

export function AdminUserDetailScreen({ userId }: AdminUserDetailScreenProps) {
  const { session } = useSession();
  const permissions = session?.user.permissionCodes ?? [];
  const canUpdate = hasPermission(permissions, 'users.update');
  const canManage = hasPermission(permissions, 'users.manage');

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['admin-user', userId],
    enabled: Boolean(session?.accessToken),
    queryFn: () => getUserById(session!.accessToken, userId),
  });

  const { data: rolesResult, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listRoles(session!.accessToken),
  });

  const roles = rolesResult?.data ?? [];
  const assignableRoles = roles.filter(
    (role) => canManage || role.code !== ROLE_CODES.SUPER_ADMIN
  );
  const isLoading = isLoadingUser || isLoadingRoles;

  return (
    <PermissionGuard permissions="users.read">
      <div>
        <PageHeader
          title="Detalhes da usuaria"
          description="Visualize dados e altere o papel da conta."
          actions={
            <Button asChild variant="outline">
              <NavLink href="/admin/usuarias">Voltar</NavLink>
            </Button>
          }
        />

        {isLoading || !user ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <UserRoleEditor
            key={user.id}
            user={user}
            userId={userId}
            assignableRoles={assignableRoles}
            canUpdate={canUpdate}
            canManage={canManage}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
