'use client';

import {
  getConversation,
  listConversations,
  listMessages,
  sendMessage,
} from '@features/conversations/api/conversations';
import { useSession } from '@features/auth/contexts/session-provider';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent } from '@shadcn/ui/card';
import { Input } from '@shadcn/ui/input';
import { ScrollArea } from '@shadcn/ui/scroll-area';
import { EmptyState } from '@ui/empty-state';
import { PageHeader } from '@ui/page-header';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from '@ui/nav-link';
import { useState } from 'react';

export function ConversationsListScreen() {
  const { session } = useSession();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listConversations(session!.accessToken),
  });

  return (
    <div>
      <PageHeader title="Conversas" description="Suas mentorias em andamento." />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="Nenhuma conversa"
          description="Aceite uma solicitacao de mentoria para iniciar uma conversa."
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const others = conversation.participants
              .filter((p) => p.user.id !== session?.user.id)
              .map((p) => `${p.user.firstName} ${p.user.lastName}`)
              .join(', ');

            return (
              <Card key={conversation.id}>
                <CardContent className="flex items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="font-medium">{others || 'Conversa'}</p>
                    <p className="text-xs text-muted-foreground">
                      Atualizada em {conversation.updatedAt ?? '—'}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <NavLink href={`/app/conversas/${conversation.id}`}>Abrir</NavLink>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

type ConversationThreadProps = {
  conversationId: string;
};

export function ConversationThreadScreen({ conversationId }: ConversationThreadProps) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    enabled: Boolean(session?.accessToken),
    queryFn: () => getConversation(session!.accessToken, conversationId),
  });

  const { data: messagesResult, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    enabled: Boolean(session?.accessToken),
    queryFn: () => listMessages(session!.accessToken, conversationId),
    refetchInterval: 12_000,
  });

  const messages = messagesResult?.data ?? [];

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error('Sem sessao');
      return sendMessage(session.accessToken, conversationId, { body });
    },
    onSuccess: () => {
      setBody('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  const title =
    conversation?.participants
      .filter((p) => p.user.id !== session?.user.id)
      .map((p) => `${p.user.firstName} ${p.user.lastName}`)
      .join(', ') ?? 'Conversa';

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader title={title} />
      <ScrollArea className="flex-1 rounded-xl border p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda. Diga ola!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const mine = message.sender.id === session?.user.id;
              return (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    mine ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <p className="text-xs opacity-80">
                    {message.sender.firstName} · {message.createdAt ?? ''}
                  </p>
                  <p>{message.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) mutation.mutate();
        }}
      >
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem..."
        />
        <Button type="submit" disabled={!body.trim() || mutation.isPending}>
          Enviar
        </Button>
      </form>
      <Button variant="link" className="mt-2 w-fit px-0" asChild>
        <NavLink href="/app/conversas">Voltar</NavLink>
      </Button>
    </div>
  );
}
