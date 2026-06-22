import { paginated } from '@core/api/api-envelope';
import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { createEventSchema } from '@features/events/dto/event.dto';
import { createEvent, listEvents } from '@features/events/server/events';

export const GET = withApiHandler({
  permissions: ['events.read'],
  handler: async ({ request }) => {
    const result = await listEvents(request.nextUrl.searchParams);
    return paginated(result.items, result.meta);
  },
});

export const POST = withApiHandler({
  permissions: ['events.write'],
  handler: async ({ request, auth }) => {
    const input = await parseJsonBody(request, createEventSchema);
    return createEvent(auth.user.id, input);
  },
});
