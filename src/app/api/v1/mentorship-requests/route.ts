import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { createMentorshipRequestSchema } from '@features/mentorship/dto/mentorship.dto';
import {
  createMentorshipRequest,
  listMentorshipRequests,
} from '@features/mentorship/server/mentorship';

export const GET = withApiHandler({
  permissions: ['mentorship_requests.read'],
  handler: async ({ auth }) => listMentorshipRequests(auth.user.id),
});

export const POST = withApiHandler({
  permissions: ['mentorship_requests.write'],
  handler: async ({ request, auth }) => {
    const input = await parseJsonBody(request, createMentorshipRequestSchema);
    return createMentorshipRequest(auth.user.id, input);
  },
});
