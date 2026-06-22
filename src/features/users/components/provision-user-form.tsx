'use client';

import { provisionUser } from '@features/users/api/users';
import { ApiClientError } from '@core/api/api-client';
import { PermissionGuard } from '@features/auth/components/permission-guard';
import { useSession } from '@features/auth/contexts/session-provider';
import { deferredRouterPush } from '@features/auth/utils/deferred-router-navigation';
import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/ui/select';
import { PageHeader } from '@ui/page-header';
import { useMutation } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProvisionUserForm() {
  const router = useRouter();
  const { session } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState<'STUDENT' | 'MENTOR'>('STUDENT');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');
      return provisionUser(session.accessToken, {
        firstName,
        lastName,
        email,
        password,
        roleCode,
      });
    },
    onSuccess: (user) => {
      toast.success('Usuaria provisionada.');
      deferredRouterPush(router, `/admin/usuarias/${user.id}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Nao foi possivel provisionar a usuaria.';
      toast.error(message);
    },
  });

  return (
    <PermissionGuard permissions="users.write">
      <div>
        <PageHeader
          title="Provisionar usuaria"
          description="Crie uma conta interna para STUDENT ou MENTOR."
          actions={
            <Button asChild variant="outline">
              <NavLink href="/admin/usuarias">Voltar</NavLink>
            </Button>
          }
        />

        <form
          className="max-w-xl space-y-4 rounded-xl border p-6"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha temporaria</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleCode">Papel inicial</Label>
            <Select
              value={roleCode}
              onValueChange={(value) => setRoleCode(value as 'STUDENT' | 'MENTOR')}
            >
              <SelectTrigger id="roleCode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Estudante</SelectItem>
                <SelectItem value="MENTOR">Mentora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </PermissionGuard>
  );
}
