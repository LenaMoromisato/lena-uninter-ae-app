'use client';

import { createMentorshipRequest, listMentorshipRequests } from '@features/mentorship/api/mentorship';
import { hasPermission } from '@features/auth/utils/has-permission';
import { useSession } from '@features/auth/contexts/session-provider';
import { getUserById } from '@features/users/api/users';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Textarea } from '@shadcn/ui/textarea';
import { ProfileCard } from '@ui/profile-card';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useState } from 'react';
import { toast } from 'sonner';

type UserProfileScreenProps = {
  userId: string;
};

export function UserProfileScreen({ userId }: UserProfileScreenProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const canRequest = hasPermission(session?.user.permissionCodes ?? [], 'mentorship_requests.write');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    enabled: Boolean(session?.accessToken),
    queryFn: () => getUserById(session!.accessToken, userId),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');
      return createMentorshipRequest(session.accessToken, { mentorId: userId, message });
    },
    onSuccess: () => {
      toast.success('Solicitacao enviada.');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
    },
    onError: () => toast.error('Nao foi possivel enviar a solicitacao.'),
  });

  if (isLoading || !user) {
    return <p className="text-sm text-muted-foreground">Carregando perfil...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" />
      <ProfileCard user={user} />
      {canRequest && user.role.code === 'MENTOR' && session?.user.id !== userId ? (
        <Card>
          <CardHeader>
            <CardTitle>Solicitar mentoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte o que voce gostaria de aprender..."
              rows={4}
            />
            <Button
              disabled={!message.trim() || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Enviar solicitacao
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <Button variant="outline" asChild>
        <NavLink href="/app/descobrir">Voltar</NavLink>
      </Button>
    </div>
  );
}

export function MentorshipScreen() {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const canManage = hasPermission(session?.user.permissionCodes ?? [], 'mentorship_requests.manage');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['mentorship-requests'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const result = await listMentorshipRequests(session!.accessToken);
      return result;
    },
  });

  const respond = async (requestId: string, action: 'accept' | 'reject') => {
    if (!session) return;
    const { acceptMentorshipRequest, rejectMentorshipRequest } = await import(
      '@features/mentorship/api/mentorship'
    );
    try {
      const result =
        action === 'accept'
          ? await acceptMentorshipRequest(session.accessToken, requestId)
          : await rejectMentorshipRequest(session.accessToken, requestId);
      toast.success(action === 'accept' ? 'Mentoria aceita.' : 'Solicitacao recusada.');
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (result.conversationId) {
        window.location.href = `/app/conversas/${result.conversationId}`;
      }
    } catch {
      toast.error('Nao foi possivel responder a solicitacao.');
    }
  };

  const sent = requests.filter((r) => r.student.id === session?.user.id);
  const received = requests.filter((r) => r.mentor.id === session?.user.id);

  return (
    <div>
      <PageHeader title="Mentorias" description="Acompanhe solicitacoes enviadas e recebidas." />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="font-medium">Enviadas</h2>
            {sent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma solicitacao enviada.</p>
            ) : (
              sent.map((request) => (
                <Card key={request.id}>
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-sm">
                      Para: {request.mentor.firstName} {request.mentor.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                    <p className="text-xs font-medium uppercase">{request.status}</p>
                    {request.conversationId ? (
                      <Button size="sm" variant="outline" asChild>
                        <NavLink href={`/app/conversas/${request.conversationId}`}>Abrir conversa</NavLink>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </section>
          <section className="space-y-3">
            <h2 className="font-medium">Recebidas</h2>
            {received.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma solicitacao recebida.</p>
            ) : (
              received.map((request) => (
                <Card key={request.id}>
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-sm">
                      De: {request.student.firstName} {request.student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                    <p className="text-xs font-medium uppercase">{request.status}</p>
                    {request.status === 'PENDING' && canManage ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => respond(request.id, 'accept')}>
                          Aceitar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => respond(request.id, 'reject')}>
                          Recusar
                        </Button>
                      </div>
                    ) : null}
                    {request.conversationId ? (
                      <Button size="sm" variant="outline" asChild>
                        <NavLink href={`/app/conversas/${request.conversationId}`}>Abrir conversa</NavLink>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}
