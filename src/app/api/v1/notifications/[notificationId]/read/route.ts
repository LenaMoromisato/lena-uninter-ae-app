import { withApiHandler } from '@core/api/with-api-handler';
import { markNotificationRead } from '@features/notifications/server/notifications';

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { notificationId } = await context.params;
  return withApiHandler({
    permissions: ['notifications.update'],
    handler: async ({ auth }) => markNotificationRead(auth.user.id, notificationId),
  })(_request as never);
}
