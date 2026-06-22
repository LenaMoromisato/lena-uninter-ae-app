import { paginated } from '@core/api/api-envelope';
import { withApiHandler } from '@core/api/with-api-handler';
import { listNotifications } from '@features/notifications/server/notifications';

export const GET = withApiHandler({
  permissions: ['notifications.read'],
  handler: async ({ request, auth }) => {
    const result = await listNotifications(auth.user.id, request.nextUrl.searchParams);
    return paginated(result.items, result.meta);
  },
});
