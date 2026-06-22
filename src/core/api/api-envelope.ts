import { NextResponse } from 'next/server';

import type { PaginationMeta } from '@core/api/pagination';

export type ApiEnvelope<T> = {
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
};

export function ok<T>(data: T, meta?: ApiEnvelope<T>['meta']) {
  const body: ApiEnvelope<T> = meta ? { data, meta } : { data };
  return NextResponse.json(body);
}

export function paginated<T>(data: T[], meta: PaginationMeta) {
  return ok(data, meta);
}
