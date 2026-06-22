import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { respondMentorshipRequestSchema } from '@features/mentorship/dto/mentorship.dto';
import { acceptMentorshipRequest } from '@features/mentorship/server/mentorship';

type RouteContext = { params: Promise<{ requestId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  return withApiHandler({
    permissions: ['mentorship_requests.manage'],
    handler: async ({ request: req, auth }) => {
      const input = await parseJsonBody(req, respondMentorshipRequestSchema);
      return acceptMentorshipRequest(requestId, auth.user.id, input);
    },
  })(request as never);
}
