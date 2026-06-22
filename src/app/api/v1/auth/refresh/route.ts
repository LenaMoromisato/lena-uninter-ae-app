import { parseJsonBody } from '@core/api/parse-request';
import { withPublicApiHandler } from '@core/api/with-api-handler';
import { refreshSchema } from '@features/auth/dto/auth.dto';
import { refreshSession } from '@features/auth/server/login';
import { mapSession } from '@features/auth/utils/map-session';

export const POST = withPublicApiHandler({
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, refreshSchema);
    const { user, session } = await refreshSession(input.refreshToken);
    return mapSession(session, user);
  },
});
