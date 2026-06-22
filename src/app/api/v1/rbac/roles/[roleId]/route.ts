import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { updateRoleSchema } from '@features/rbac/dto/rbac.dto';
import { deleteRole, getRole, updateRole } from '@features/rbac/server/rbac';

type RouteContext = { params: Promise<{ roleId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { roleId } = await context.params;
  return withApiHandler({
    permissions: ['roles.read'],
    handler: async () => getRole(roleId),
  })(_request as never);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { roleId } = await context.params;
  return withApiHandler({
    permissions: ['roles.update'],
    handler: async ({ request: req }) => {
      const input = await parseJsonBody(req, updateRoleSchema);
      return updateRole(roleId, input);
    },
  })(request as never);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { roleId } = await context.params;
  return withApiHandler({
    permissions: ['roles.manage'],
    handler: async () => deleteRole(roleId),
  })(_request as never);
}
