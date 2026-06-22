import { apiFetch } from '@core/api/api-client';

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  readAt: string | null;
  createdAt: string | null;
};

export async function listNotifications(token: string, page = 1, limit = 20) {
  return apiFetch<Notification[]>('/notifications', {
    token,
    searchParams: { page, limit },
  });
}

export async function markNotificationRead(token: string, notificationId: string) {
  const result = await apiFetch<{ id: string; readAt: string | null }>(
    `/notifications/${notificationId}/read`,
    { method: 'POST', token }
  );
  return result.data;
}
