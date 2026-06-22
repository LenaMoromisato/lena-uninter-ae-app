import type {
  CreateMentorshipRequestInput,
  RespondMentorshipRequestInput,
} from '@features/mentorship/dto/mentorship.dto';
import type { SessionUser } from '@features/auth/models/session';
import { apiFetch } from '@core/api/api-client';

export type MentorshipRequest = {
  id: string;
  message: string;
  status: string;
  responseMessage: string | null;
  requestedAt: string | null;
  respondedAt: string | null;
  student: SessionUser;
  mentor: SessionUser;
  conversationId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function listMentorshipRequests(token: string) {
  const result = await apiFetch<MentorshipRequest[]>('/mentorship-requests', { token });
  return result.data;
}

export async function createMentorshipRequest(
  token: string,
  input: CreateMentorshipRequestInput
) {
  const result = await apiFetch<MentorshipRequest>('/mentorship-requests', {
    method: 'POST',
    body: input,
    token,
  });
  return result.data;
}

export async function acceptMentorshipRequest(
  token: string,
  requestId: string,
  input: RespondMentorshipRequestInput = {}
) {
  const result = await apiFetch<MentorshipRequest>(
    `/mentorship-requests/${requestId}/accept`,
    { method: 'POST', body: input, token }
  );
  return result.data;
}

export async function rejectMentorshipRequest(
  token: string,
  requestId: string,
  input: RespondMentorshipRequestInput = {}
) {
  const result = await apiFetch<MentorshipRequest>(
    `/mentorship-requests/${requestId}/reject`,
    { method: 'POST', body: input, token }
  );
  return result.data;
}
