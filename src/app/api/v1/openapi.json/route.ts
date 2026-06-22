import { NextResponse } from 'next/server';

import { buildOpenApiSpec } from '@core/openapi/build-openapi-spec';

export function GET() {
  return NextResponse.json(buildOpenApiSpec());
}
