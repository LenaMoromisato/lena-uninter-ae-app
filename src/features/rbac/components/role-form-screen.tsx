'use client';

import type { RoleResponse } from '@features/rbac/api/rbac';
import {
  createRole,
  deleteRole,
  getRole,
  listPermissions,
  updateRole,
} from '@features/rbac/api/rbac';
import { ApiClientError } from '@core/api/api-client';
import type { PermissionCode } from '@core/constants/permissions';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { deferredRouterPush } from '@features/auth/utils/deferred-router-navigation';
import { PermissionMatrix } from '@features/rbac/components/permission-matrix';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Skeleton } from '@shadcn/ui/skeleton';
import { Textarea } from '@shadcn/ui/textarea';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type RoleFormScreenProps = {
  roleId?: string;
};

type RoleFormFieldsProps = {
  role?: RoleResponse;
  roleId?: string;
  allPermissions: Awaited<ReturnType<typeof listPermissions>>;
  canUpdate: boolean;
  canDelete: boolean;
  isCreate: boolean;
};

function RoleFormFields({
  role,
  roleId,
  allPermissions,
  canUpdate,
  canDelete,
  isCreate,
}: RoleFormFieldsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [code, setCode] = useState(role?.code ?? '');
  const [label, setLabel] = useState(role?.label ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissionCodes, setPermissionCodes] = useState<PermissionCode[]>(
    (role?.permissionCodes as PermissionCode[] | undefined) ?? []
  );

  const readOnly = !isCreate && !canUpdate;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');

      if (isCreate) {
        return createRole(session.accessToken, {
          code,
          label,
          description: description || undefined,
          permissionCodes,
        });
      }

      if (!canUpdate) {
        throw new ApiClientError(403, 'FORBIDDEN', 'Sem permissao para editar.');
      }

      return updateRole(session.accessToken, roleId!, {
        label,
        description: description || null,
        permissionCodes,
      });
    },
    onSuccess: (savedRole) => {
      toast.success(isCreate ? 'Papel criado.' : 'Papel atualizado.');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role', savedRole.id] });
      deferredRouterPush(router, `/admin/roles/${savedRole.id}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel salvar o papel.';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!session || !roleId) throw new Error('Sem sessao');
      return deleteRole(session.accessToken, roleId);
    },
    onSuccess: () => {
      toast.success('Papel removido.');
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      deferredRouterPush(router, '/admin/roles');
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel remover o papel.';
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Codigo</Label>
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            disabled={!isCreate}
            placeholder="COORDENADORA"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Nome</Label>
          <Input
            id="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            disabled={readOnly}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descricao</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={readOnly}
          rows={3}
        />
      </div>

      {role?.isSystem ? (
        <Badge variant="secondary">Papel de sistema — exclusao desabilitada</Badge>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Permissoes</h2>
        <PermissionMatrix
          permissions={allPermissions}
          selectedCodes={permissionCodes}
          onChange={setPermissionCodes}
          disabled={readOnly}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {!readOnly ? (
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        ) : null}
        {!isCreate && canDelete && role && !role.isSystem && role.userCount === 0 ? (
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Excluir papel'}
          </Button>
        ) : null}
      </div>

      {!isCreate && canUpdate ? (
        <p className="text-xs text-muted-foreground">
          Usuarias com este papel precisam sair e entrar novamente para ver permissoes
          atualizadas.
        </p>
      ) : null}
    </form>
  );
}

export function RoleFormScreen({ roleId }: RoleFormScreenProps) {
  const isCreate = !roleId;
  const { session } = useSession();
  const permissions = session?.user.permissionCodes ?? [];
  const canUpdate = hasPermission(permissions, 'roles.update');
  const canDelete = hasPermission(permissions, 'roles.manage');

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ['admin-role', roleId],
    enabled: Boolean(session?.accessToken && roleId),
    queryFn: () => getRole(session!.accessToken, roleId!),
  });

  const { data: allPermissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['admin-permissions'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listPermissions(session!.accessToken),
  });

  const isLoading = !isCreate && (isLoadingRole || isLoadingPermissions);

  return (
    <PermissionGuard permissions={isCreate ? 'roles.write' : 'roles.read'}>
      <div>
        <PageHeader
          title={isCreate ? 'Novo papel' : 'Editar papel'}
          description={
            isCreate
              ? 'Defina codigo, nome e permissoes do novo papel.'
              : 'Atualize nome, descricao e permissoes deste papel.'
          }
          actions={
            <Button asChild variant="outline">
              <NavLink href="/admin/roles">Voltar</NavLink>
            </Button>
          }
        />

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isCreate ? (
          <RoleFormFields
            allPermissions={allPermissions}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isCreate
          />
        ) : role ? (
          <RoleFormFields
            key={role.id}
            role={role}
            roleId={roleId}
            allPermissions={allPermissions}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isCreate={false}
          />
        ) : null}
      </div>
    </PermissionGuard>
  );
}
