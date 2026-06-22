import { parseJsonBody } from '@core/api/parse-request';
import { withPublicApiHandler } from '@core/api/with-api-handler';
import { loginSchema } from '@features/auth/dto/auth.dto';
import { loginUser } from '@features/auth/server/login';
import { mapSession } from '@features/auth/utils/map-session';

export const POST = withPublicApiHandler({
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, loginSchema);
    const { user, session } = await loginUser(input);
    return mapSession(session, user);
  },
});
