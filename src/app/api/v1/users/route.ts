import { paginated } from '@core/api/api-envelope';
import { parseJsonBody, parseQuery } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { registerSchema } from '@features/auth/dto/auth.dto';
import { listUsersQuerySchema } from '@features/users/dto/user.dto';
import { listUsers, provisionUser } from '@features/users/server/users';

export const GET = withApiHandler({
  permissions: ['profiles.read'],
  handler: async ({ request }) => {
    const query = parseQuery(request, listUsersQuerySchema);
    const result = await listUsers(query);
    return paginated(result.items, result.meta);
  },
});

export const POST = withApiHandler({
  permissions: ['users.write'],
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, registerSchema);
    return provisionUser(input);
  },
});
