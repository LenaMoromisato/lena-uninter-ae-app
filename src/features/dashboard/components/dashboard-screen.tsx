'use client';

import { listMentorshipRequests } from '@features/mentorship/api/mentorship';
import { listNotifications } from '@features/notifications/api/notifications';
import { useSession } from '@features/auth/contexts/session-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { PageHeader } from '@ui/page-header';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';

export function DashboardScreen() {
  const { session } = useSession();

  const { data: requests = [] } = useQuery({
    queryKey: ['mentorship-requests'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listMentorshipRequests(session!.accessToken),
  });

  const { data: notificationsResult } = useQuery({
    queryKey: ['notifications'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listNotifications(session!.accessToken, 1, 5),
  });

  const pending = requests.filter((r) => r.status === 'PENDING');
  const unread = (notificationsResult?.data ?? []).filter((n) => !n.readAt).length;

  return (
    <div>
      <PageHeader
        title={`Ola, ${session?.user.firstName}`}
        description="Resumo da sua jornada de mentoria."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mentorias pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pending.length}</p>
            <NavLink href="/app/mentorias" className="text-sm text-primary underline-offset-4 hover:underline">
              Ver mentorias
            </NavLink>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificacoes nao lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{unread}</p>
            <NavLink
              href="/app/notificacoes"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Ver notificacoes
            </NavLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
