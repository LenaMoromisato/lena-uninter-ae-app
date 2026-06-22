import type { CreateMessageInput } from '@features/conversations/dto/conversation.dto';
import type { SessionUser } from '@features/auth/models/session';
import { apiFetch } from '@core/api/api-client';

export type Conversation = {
  id: string;
  mentorshipRequestId: string | null;
  participants: Array<{
    id: string;
    user: SessionUser;
    joinedAt: string | null;
  }>;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Message = {
  id: string;
  body: string;
  parentMessageId: string | null;
  meta: unknown;
  sender: SessionUser;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function listConversations(token: string) {
  const result = await apiFetch<Conversation[]>('/conversations', { token });
  return result.data;
}

export async function getConversation(token: string, conversationId: string) {
  const result = await apiFetch<Conversation>(`/conversations/${conversationId}`, { token });
  return result.data;
}

export async function listMessages(
  token: string,
  conversationId: string,
  page = 1,
  limit = 50
) {
  return apiFetch<Message[]>(`/conversations/${conversationId}/messages`, {
    token,
    searchParams: { page, limit },
  });
}

export async function sendMessage(
  token: string,
  conversationId: string,
  input: CreateMessageInput
) {
  const result = await apiFetch<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: input,
    token,
  });
  return result.data;
}
