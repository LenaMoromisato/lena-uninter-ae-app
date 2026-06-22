import { parseJsonBody } from '@core/api/parse-request';
import { paginated } from '@core/api/api-envelope';
import { withApiHandler, withPublicApiHandler } from '@core/api/with-api-handler';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from '@features/auth/dto/auth.dto';
import { loginUser, logoutUser, refreshSession } from '@features/auth/server/login';
import { registerUser } from '@features/auth/server/register';
import { mapSession, mapUserResponse } from '@features/auth/utils/map-session';

export const POST = withPublicApiHandler({
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, registerSchema);
    const result = await registerUser(input);

    if (!result.session) {
      return { user: mapUserResponse(result.user), session: null };
    }

    return mapSession(result.session, result.user);
  },
});
