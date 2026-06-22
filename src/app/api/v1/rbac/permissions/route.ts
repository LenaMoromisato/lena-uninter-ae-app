import { withApiHandler } from '@core/api/with-api-handler';
import { listPermissions } from '@features/rbac/server/rbac';

export const GET = withApiHandler({
  permissions: ['permissions.read'],
  handler: async () => listPermissions(),
});
