import { withApiHandler } from '@core/api/with-api-handler';
import { forbidden } from '@core/api/api-error';
import { parseJsonBody } from '@core/api/parse-request';
import { getUserById, updateUserAdmin } from '@features/users/server/users';
import { updateUserAdminSchema } from '@features/users/dto/user.dto';

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params;
  return withApiHandler({
    permissions: ['profiles.read'],
    handler: async () => getUserById(userId),
  })(_request as never);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params;
  return withApiHandler({
    handler: async ({ request: req, auth }) => {
      if (!auth.hasPermission('users.update') && !auth.hasPermission('users.manage')) {
        throw forbidden();
      }

      const input = await parseJsonBody(req, updateUserAdminSchema);
      return updateUserAdmin(userId, input, {
        userId: auth.user.id,
        hasPermission: auth.hasPermission,
      });
    },
  })(request as never);
}
