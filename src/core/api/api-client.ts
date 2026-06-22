import type { PaginationMeta, Session } from '@features/auth/models/session';

const API_BASE = '/api/v1';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type ApiEnvelope<T> = {
  data: T;
  meta?: PaginationMeta;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ApiListResult<T> = {
  data: T;
  meta?: PaginationMeta;
};

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  searchParams?: Record<string, string | number | undefined | null>;
};

let refreshHandler: (() => Promise<Session | null>) | null = null;

export function setRefreshHandler(handler: () => Promise<Session | null>) {
  refreshHandler = handler;
}

function buildUrl(path: string, searchParams?: FetchOptions['searchParams']) {
  const url = new URL(`${API_BASE}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.pathname + url.search;
}

async function parseResponse<T>(response: Response): Promise<ApiListResult<T>> {
  const json = (await response.json()) as ApiEnvelope<T> & ApiErrorBody;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      json.error?.code ?? 'UNKNOWN_ERROR',
      json.error?.message ?? 'Erro na requisicao.'
    );
  }

  return { data: json.data, meta: json.meta };
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
  retry = true
): Promise<ApiListResult<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(buildUrl(path, options.searchParams), {
    method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && retry && refreshHandler && options.token) {
    const refreshed = await refreshHandler();

    if (refreshed) {
      return apiFetch<T>(path, { ...options, token: refreshed.accessToken }, false);
    }
  }

  return parseResponse<T>(response);
}
