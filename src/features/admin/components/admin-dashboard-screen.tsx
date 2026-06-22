'use client';

import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { PageHeader } from '@ui/page-header';
import { Shield, UserPlus, Users } from 'lucide-react';
import { NavLink } from '@ui/nav-link';

export function AdminDashboardScreen() {
  const { session } = useSession();
  const permissions = session?.user.permissionCodes ?? [];

  const cards = [
    {
      title: 'Papeis e permissoes',
      description: 'Gerencie roles e a matriz de permissoes do sistema.',
      href: '/admin/roles',
      permission: 'roles.read',
      icon: Shield,
    },
    {
      title: 'Usuarias',
      description: 'Liste e edite papeis das usuarias cadastradas.',
      href: '/admin/usuarias',
      permission: 'users.read',
      icon: Users,
    },
    {
      title: 'Provisionar usuaria',
      description: 'Crie contas internas para novas participantes.',
      href: '/admin/usuarias/nova',
      permission: 'users.write',
      icon: UserPlus,
    },
  ].filter((card) => hasPermission(permissions, card.permission));

  return (
    <div>
      <PageHeader
        title="Administracao"
        description="Gerencie permissoes, papeis e usuarias da plataforma."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.href}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <Button asChild variant="outline" size="sm">
                  <NavLink href={card.href}>Abrir</NavLink>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
