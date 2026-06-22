'use client';

import { createEvent, listEvents, registerForEvent } from '@features/events/api/events';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { Badge } from '@shadcn/ui/badge';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { Label } from '@shadcn/ui/label';
import { Textarea } from '@shadcn/ui/textarea';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export function EventsScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const canCreate = hasPermission(session?.user.permissionCodes ?? [], 'events.write');
  const canRegister = hasPermission(session?.user.permissionCodes ?? [], 'event_registrations.write');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const { data: result, isLoading } = useQuery({
    queryKey: ['events'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listEvents(session!.accessToken),
  });

  const events = result?.data ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');
      return createEvent(session.accessToken, {
        title,
        description,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        status: 'PUBLISHED',
        isOnline: true,
      });
    },
    onSuccess: () => {
      toast.success('Evento criado.');
      setShowForm(false);
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => toast.error('Nao foi possivel criar o evento.'),
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => registerForEvent(session!.accessToken, eventId),
    onSuccess: () => {
      toast.success('Inscricao realizada.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => toast.error('Nao foi possivel inscrever-se.'),
  });

  return (
    <div>
      <PageHeader
        title="Eventos"
        description="Workshops, encontros e atividades da comunidade."
        actions={
          canCreate ? (
            <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancelar' : 'Novo evento'}
            </Button>
          ) : null
        }
      />

      {showForm && canCreate ? (
        <Card className="mb-6">
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titulo</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">Inicio</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Fim</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                disabled={!title || !description || !startsAt || !endsAt || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                Publicar evento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : events.length === 0 ? (
        <EmptyState title="Nenhum evento" description="Novos eventos aparecerao aqui." />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{event.title}</p>
                    <Badge variant="secondary">{event.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.startsAt} · {event.registrationsCount} inscritas
                  </p>
                </div>
                {canRegister ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={registerMutation.isPending}
                    onClick={() => registerMutation.mutate(event.id)}
                  >
                    Inscrever-se
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
