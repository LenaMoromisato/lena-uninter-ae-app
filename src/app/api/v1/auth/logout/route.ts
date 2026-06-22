import { parseJsonBody } from '@core/api/parse-request';
import { withPublicApiHandler } from '@core/api/with-api-handler';
import { logoutSchema } from '@features/auth/dto/auth.dto';
import { logoutUser } from '@features/auth/server/login';

export const POST = withPublicApiHandler({
  handler: async ({ request }) => {
    const input = await parseJsonBody(request, logoutSchema);
    return logoutUser(input.accessToken);
  },
});
