import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { createEventSchema } from '@features/events/dto/event.dto';
import { getEvent, updateEvent } from '@features/events/server/events';

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  return withApiHandler({
    permissions: ['events.read'],
    handler: async () => getEvent(eventId),
  })(_request as never);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  return withApiHandler({
    permissions: ['events.update'],
    handler: async ({ request: req, auth }) => {
      const input = await parseJsonBody(req, createEventSchema);
      const canManage = auth.hasPermission('events.manage');
      return updateEvent(eventId, auth.user.id, canManage, input);
    },
  })(request as never);
}
