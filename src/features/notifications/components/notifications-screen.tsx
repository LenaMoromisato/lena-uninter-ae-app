'use client';

import { listNotifications, markNotificationRead } from '@features/notifications/api/notifications';
import { useSession } from '@features/auth/contexts/session-provider';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent } from '@shadcn/ui/card';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function NotificationsScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const { data: result, isLoading } = useQuery({
    queryKey: ['notifications'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listNotifications(session!.accessToken),
  });

  const notifications = result?.data ?? [];

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(session!.accessToken, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div>
      <PageHeader title="Notificacoes" description="Atualizacoes sobre mentorias e eventos." />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : notifications.length === 0 ? (
        <EmptyState title="Sem notificacoes" description="Voce esta em dia." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.readAt ? <Badge>Nova</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">{notification.createdAt}</p>
                </div>
                {!notification.readAt ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead.mutate(notification.id)}
                  >
                    Marcar lida
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
