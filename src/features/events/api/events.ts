import type { CreateEventInput } from '@features/events/dto/event.dto';
import type { SessionUser } from '@features/auth/models/session';
import { apiFetch } from '@core/api/api-client';

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  isOnline: boolean;
  relevanceScore: number;
  capacity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  meta: unknown;
  createdBy: SessionUser;
  registrationsCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function listEvents(token: string, page = 1, limit = 20) {
  return apiFetch<Event[]>('/events', {
    token,
    searchParams: { page, limit },
  });
}

export async function createEvent(token: string, input: CreateEventInput) {
  const result = await apiFetch<Event>('/events', {
    method: 'POST',
    body: input,
    token,
  });
  return result.data;
}

export async function registerForEvent(token: string, eventId: string) {
  const result = await apiFetch<{ id: string }>(`/events/${eventId}/registrations`, {
    method: 'POST',
    token,
  });
  return result.data;
}
