import { withApiHandler } from '@core/api/with-api-handler';
import { listConversations } from '@features/conversations/server/conversations';

export const GET = withApiHandler({
  permissions: ['conversations.read'],
  handler: async ({ auth }) => listConversations(auth.user.id),
});
