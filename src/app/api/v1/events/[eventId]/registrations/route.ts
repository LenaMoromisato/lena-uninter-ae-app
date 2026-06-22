import { withApiHandler } from '@core/api/with-api-handler';
import { registerForEvent } from '@features/events/server/events';

type RouteContext = { params: Promise<{ eventId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  return withApiHandler({
    permissions: ['event_registrations.write'],
    handler: async ({ auth }) => registerForEvent(eventId, auth.user.id),
  })(_request as never);
}
