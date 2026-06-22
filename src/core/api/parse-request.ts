import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { badRequest } from '@core/api/api-error';

export async function parseJsonBody<T>(request: NextRequest, schema: ZodType<T>) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw badRequest('Corpo JSON invalido.');
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw badRequest(message || 'Payload invalido.');
  }

  return result.data;
}

export function parseQuery<T>(request: NextRequest, schema: ZodType<T>) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw badRequest(message || 'Query invalida.');
  }

  return result.data;
}
