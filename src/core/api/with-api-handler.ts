import type { NextRequest, NextResponse } from 'next/server';

import { forbidden } from '@core/api/api-error';
import { toErrorResponse } from '@core/api/api-error';
import { ok } from '@core/api/api-envelope';
import {
  resolveAuthContext,
  type AuthContext,
} from '@core/api/auth-context';

type HandlerContext = {
  request: NextRequest;
  auth: AuthContext;
};

type PublicHandlerContext = {
  request: NextRequest;
};

type ProtectedHandlerOptions = {
  permissions?: string[];
  handler: (ctx: HandlerContext) => Promise<unknown | NextResponse>;
};

type PublicHandlerOptions = {
  handler: (ctx: PublicHandlerContext) => Promise<unknown | NextResponse>;
};

function isResponse(value: unknown): value is NextResponse {
  return value instanceof Response;
}

async function executeHandler(
  request: NextRequest,
  handler: (ctx: HandlerContext | PublicHandlerContext) => Promise<unknown | NextResponse>,
  auth?: AuthContext
) {
  const result = await handler(auth ? { request, auth } : { request });

  if (isResponse(result)) {
    return result;
  }

  return ok(result);
}

export function withApiHandler(options: ProtectedHandlerOptions) {
  return async (request: NextRequest) => {
    try {
      const auth = await resolveAuthContext(request);

      if (options.permissions?.length) {
        const missing = options.permissions.filter((code) => !auth.hasPermission(code));

        if (missing.length > 0) {
          throw forbidden();
        }
      }

      return executeHandler(request, options.handler, auth);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function withPublicApiHandler(options: PublicHandlerOptions) {
  return async (request: NextRequest) => {
    try {
      return executeHandler(request, options.handler);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export type { AuthContext, HandlerContext, PublicHandlerContext };
