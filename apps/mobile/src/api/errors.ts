import type { ApiError, ErrorCode } from '@medikart/shared';
import axios from 'axios';

export type ApiErrorKind =
  /** The server answered with the single error format `{ code, message, details, traceId }`. */
  | 'api'
  /** No answer: no connection, server unreachable. */
  | 'network'
  /** No answer in time. */
  | 'timeout'
  /** An answer that is not in the error format (proxy page, crash) or any other failure. */
  | 'unexpected';

/**
 * Every failure of the HTTP client, turned into one typed error (report §10.1). Screens show a
 * translated message chosen from `code` (see `useApiErrorMessage`), never `apiError.message`,
 * which is technical and in English. `traceId` is for logs and support only.
 */
export class ApiClientError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly apiError: ApiError | undefined;
  readonly traceId: string | undefined;

  constructor(init: {
    kind: ApiErrorKind;
    status?: number;
    apiError?: ApiError;
    traceId?: string;
  }) {
    // The message is safe to log: no server text, no request data.
    const parts = [`API ${init.kind}`];
    if (init.status !== undefined) parts.push(String(init.status));
    if (init.apiError) parts.push(init.apiError.code);
    const traceId = init.traceId ?? init.apiError?.traceId;
    if (traceId) parts.push(`traceId=${traceId}`);
    super(parts.join(' '));
    this.name = 'ApiClientError';
    this.kind = init.kind;
    this.status = init.status;
    this.apiError = init.apiError;
    this.traceId = traceId;
  }

  /** The error code of the catalog, when the server sent one (may be unknown to an older app). */
  get code(): ErrorCode | undefined {
    return this.apiError?.code;
  }
}

/** Shape check of the single error format. Unknown codes are accepted (newer server). */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.code === 'string' &&
    typeof v.message === 'string' &&
    typeof v.traceId === 'string' &&
    Array.isArray(v.details)
  );
}

function readHeader(headers: unknown, name: string): string | undefined {
  if (typeof headers !== 'object' || headers === null) return undefined;
  const get = (headers as { get?: (n: string) => unknown }).get;
  const value =
    typeof get === 'function'
      ? get.call(headers, name)
      : (headers as Record<string, unknown>)[name.toLowerCase()];
  return typeof value === 'string' ? value : undefined;
}

/** Converts whatever the transport threw. A cancellation is returned as is (not an error to show). */
export function toApiClientError(error: unknown): unknown {
  if (error instanceof ApiClientError) return error;
  if (axios.isCancel(error)) return error;
  if (!axios.isAxiosError(error)) return new ApiClientError({ kind: 'unexpected' });

  const response = error.response;
  if (response) {
    const traceId = readHeader(response.headers, 'x-trace-id');
    if (isApiError(response.data)) {
      return new ApiClientError({
        kind: 'api',
        status: response.status,
        apiError: response.data,
        traceId,
      });
    }
    return new ApiClientError({ kind: 'unexpected', status: response.status, traceId });
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiClientError({ kind: 'timeout' });
  }
  if (error.code === 'ERR_NETWORK') return new ApiClientError({ kind: 'network' });
  return new ApiClientError({ kind: 'unexpected' });
}
