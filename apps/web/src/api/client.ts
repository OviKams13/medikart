import type { ApiError, AppConfigResponse } from '@medikart/shared';
import { useCallback, useEffect, useState } from 'react';
import { i18next, useErrorMessage, useTranslation } from '../i18n';

/** Path prefix of every route of the backend (report §10.1). */
export const API_PREFIX = '/api/v1';

/**
 * Backend address. Empty in development: the browser calls the dashboard's own origin and Vite
 * forwards `/api` to the backend (see vite.config.ts). Hosted builds set `VITE_API_BASE_URL`
 * (a public address, never a secret).
 */
export function resolveApiBaseUrl(
  configured: string | undefined = import.meta.env.VITE_API_BASE_URL,
) {
  return (configured ?? '').replace(/\/+$/, '');
}

export type ApiRequestErrorKind = 'api' | 'network' | 'unexpected';

/** Everything that can go wrong with a request, typed. Clients translate `apiError.code`. */
export class ApiRequestError extends Error {
  readonly kind: ApiRequestErrorKind;
  readonly status?: number;
  readonly apiError?: ApiError;

  constructor(kind: ApiRequestErrorKind, status?: number, apiError?: ApiError) {
    // The message holds no server text: it can reach logs.
    super(`${kind}${status ? ` ${status}` : ''}${apiError ? ` ${apiError.code}` : ''}`);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = status;
    this.apiError = apiError;
  }
}

function isApiErrorBody(body: unknown): body is ApiError {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { code?: unknown }).code === 'string' &&
    typeof (body as { message?: unknown }).message === 'string'
  );
}

/** GET a JSON route of the API. Public routes only until login exists (point 5). */
export async function getJson<T>(
  path: string,
  options: { signal?: AbortSignal; baseUrl?: string; fetchImpl?: typeof fetch } = {},
): Promise<T> {
  const { signal, baseUrl = resolveApiBaseUrl(), fetchImpl = fetch } = options;
  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${API_PREFIX}${path}`, {
      signal,
      headers: { Accept: 'application/json', 'Accept-Language': i18next.language },
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new ApiRequestError('network');
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (response.ok) return body as T;
  if (isApiErrorBody(body)) throw new ApiRequestError('api', response.status, body);
  // Not the single error format (a proxy page, for example): never shown as a business error.
  throw new ApiRequestError('unexpected', response.status);
}

/** `GET /api/v1/app-config` (public): minimum version, legal links, support contact. */
export function fetchAppConfig(options?: Parameters<typeof getJson>[1]) {
  return getJson<AppConfigResponse>('/app-config', options);
}

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiRequestError };

/** `/app-config` for a page, with a `reload` function. */
export function useAppConfig(): AsyncState<AppConfigResponse> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<AppConfigResponse>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchAppConfig({ signal: controller.signal }).then(
      (data) => setState({ status: 'success', data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          error: error instanceof ApiRequestError ? error : new ApiRequestError('unexpected'),
        });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);
  return { ...state, reload };
}

/** The translated text of a request error: the code's message, or a network / generic text. */
export function useApiErrorMessage(): (error: ApiRequestError) => string {
  const { t } = useTranslation();
  const messageOf = useErrorMessage();
  return (error) =>
    error.kind === 'network'
      ? t('errorsFallback.network')
      : error.kind === 'api'
        ? messageOf(error.apiError?.code)
        : t('errorsFallback.unknown');
}
