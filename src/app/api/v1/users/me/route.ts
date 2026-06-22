import { parseJsonBody } from '@core/api/parse-request';
import { withApiHandler } from '@core/api/with-api-handler';
import { updateProfileSchema } from '@features/users/dto/user.dto';
import { getMe, updateMe } from '@features/users/server/users';

export const GET = withApiHandler({
  permissions: ['profiles.read'],
  handler: async ({ auth }) => getMe(auth.user.id),
});

export const PATCH = withApiHandler({
  permissions: ['profiles.update'],
  handler: async ({ request, auth }) => {
    const input = await parseJsonBody(request, updateProfileSchema);
    return updateMe(auth.user.id, input);
  },
});
