import { withApiHandler } from '@core/api/with-api-handler';
import { getConversation } from '@features/conversations/server/conversations';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  return withApiHandler({
    permissions: ['conversations.read'],
    handler: async ({ auth }) => getConversation(conversationId, auth.user.id),
  })(_request as never);
}
