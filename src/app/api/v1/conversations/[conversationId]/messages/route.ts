import { paginated } from '@core/api/api-envelope';
import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { createMessageSchema } from '@features/conversations/dto/conversation.dto';
import { listMessages, sendMessage } from '@features/conversations/server/conversations';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  return withApiHandler({
    permissions: ['messages.read'],
    handler: async ({ request: req, auth }) => {
      const result = await listMessages(
        conversationId,
        auth.user.id,
        req.nextUrl.searchParams
      );
      return paginated(result.items, result.meta);
    },
  })(request as never);
}

export async function POST(request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  return withApiHandler({
    permissions: ['messages.write'],
    handler: async ({ request: req, auth }) => {
      const input = await parseJsonBody(req, createMessageSchema);
      return sendMessage(conversationId, auth.user.id, input);
    },
  })(request as never);
}
