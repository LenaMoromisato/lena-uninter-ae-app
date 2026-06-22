import { APP_API_NAME } from '@core/constants/app';
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    name: APP_API_NAME,
    docs: '/api/docs',
    openapi: '/api/v1/openapi.json',
    version: 'v1',
  });
}
