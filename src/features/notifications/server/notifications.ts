import { notFound } from '@core/api/api-error';
import { buildPaginationMeta, parsePagination } from '@core/api/pagination';
import { toIsoString } from '@core/utils/to-iso-string';
import { db } from '@core/lib/db';

export async function listNotifications(userId: string, searchParams: URLSearchParams) {
  const pagination = parsePagination(searchParams);
  const where = { userId };

  const [total, notifications] = await Promise.all([
    db.notification.count({ where }),
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
  ]);

  return {
    items: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      readAt: toIsoString(notification.readAt),
      createdAt: toIsoString(notification.createdAt),
    })),
    meta: buildPaginationMeta(total, pagination),
  };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await db.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw notFound('Notificacao nao encontrada.');
  }

  const updated = await db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  return {
    id: updated.id,
    readAt: toIsoString(updated.readAt),
  };
}
