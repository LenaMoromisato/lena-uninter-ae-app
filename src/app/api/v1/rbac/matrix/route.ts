import { withApiHandler } from '@core/api/with-api-handler';
import { getRbacMatrix } from '@features/rbac/server/rbac';

export const GET = withApiHandler({
  permissions: ['roles.read'],
  handler: async () => getRbacMatrix(),
});
