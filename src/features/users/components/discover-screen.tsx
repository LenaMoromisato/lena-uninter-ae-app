'use client';

import { listUsers } from '@features/users/api/users';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Skeleton } from '@shadcn/ui/skeleton';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { ProfileCard } from '@ui/profile-card';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function DiscoverScreen() {
  const { session } = useSession();
  const [q, setQ] = useState('');
  const [workArea, setWorkArea] = useState('');
  const [languages, setLanguages] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    workArea: '',
    programmingLanguages: '',
    roleCode: 'MENTOR',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', filters],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const result = await listUsers(session!.accessToken, {
        ...filters,
        page: 1,
        limit: 24,
      });
      return result;
    },
  });

  const users = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Descobrir"
        description="Encontre mentoras por area, linguagens e nome."
      />
      <form
        className="mb-6 grid gap-4 rounded-xl border p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({
            q,
            workArea,
            programmingLanguages: languages,
            roleCode: 'MENTOR',
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="q">Busca</Label>
          <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou e-mail" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workArea">Area</Label>
          <Input id="workArea" value={workArea} onChange={(e) => setWorkArea(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages">Linguagens</Label>
          <Input
            id="languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="TypeScript, Python"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Buscar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState title="Erro ao carregar usuarias" description="Tente novamente em instantes." />
      ) : users.length === 0 ? (
        <EmptyState
          title="Nenhum resultado"
          description="Ajuste os filtros ou tente outra busca."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <ProfileCard key={user.id} user={user} href={`/app/descobrir/${user.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
