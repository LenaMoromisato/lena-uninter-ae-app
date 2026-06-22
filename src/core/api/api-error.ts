import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function badRequest(message: string) {
  return new ApiError(400, 'VALIDATION_ERROR', message);
}

export function unauthorized(message = 'Bearer token ausente, invalido ou expirado.') {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = 'Usuaria autenticada sem permissao suficiente.') {
  return new ApiError(403, 'FORBIDDEN', message);
}

export function notFound(message: string) {
  return new ApiError(404, 'NOT_FOUND', message);
}

export function conflict(message: string) {
  return new ApiError(409, 'CONFLICT', message);
}

export function internalError(message = 'Erro interno do servidor.') {
  return new ApiError(500, 'INTERNAL_ERROR', message);
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' } },
    { status: 500 }
  );
}
