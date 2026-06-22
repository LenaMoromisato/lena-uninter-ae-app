import { paginated } from '@core/api/api-envelope';
import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { createRoleSchema } from '@features/rbac/dto/rbac.dto';
import { createRole, listRoles } from '@features/rbac/server/rbac';

export const GET = withApiHandler({
  permissions: ['roles.read'],
  handler: async ({ request }) => {
    const result = await listRoles(request.nextUrl.searchParams);
    return paginated(result.items, result.meta);
  },
});

export const POST = withApiHandler({
  permissions: ['roles.write'],
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, createRoleSchema);
    return createRole(input);
  },
});
