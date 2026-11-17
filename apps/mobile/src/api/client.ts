import axios, { type AxiosAdapter, type AxiosRequestConfig } from 'axios';
import { measureClockOffset } from './clock';
import { API_PREFIX } from './config';
import { ApiClientError, toApiClientError } from './errors';

/**
 * HOOK POINT for point 5 (login). Returns the Firebase ID token to send as `Authorization: Bearer`,
 * or nothing when nobody is signed in. Point 5 supplies it (and adds the forced refresh + one
 * retry on a 401, report §12). There is no token before that: the client sends none.
 */
export type AuthTokenProvider = () => Promise<string | null | undefined>;

export type ApiClientOptions = {
  /** Server address without path, e.g. `http://10.0.2.2:8080` (see `resolveApiBaseUrl`). */
  baseUrl: string;
  timeoutMs?: number;
  getAuthToken?: AuthTokenProvider;
  /** Current app language, sent as `Accept-Language` (report §10.1). */
  getLanguage?: () => string;
  /** Called with a new clock offset (ms) measured from the `Date` header of a response. */
  onClockOffset?: (offsetMs: number) => void;
  /** Called for every failure, before it is thrown: logging (traceId) goes here. */
  onError?: (error: ApiClientError) => void;
  /** Phone clock in ms, replaceable in tests. */
  systemNowMs?: () => number;
  /** Replaces the network layer: tests give a fake one. */
  adapter?: AxiosAdapter;
};

export type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** `false` for the public routes (`/health`, `/app-config`): no token is added. Default: true. */
  authenticated?: boolean;
};

export type ApiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
};

export const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * The one HTTP client of the app. Paths are relative to `/api/v1` (`/app-config`). Failures are
 * thrown as `ApiClientError`; the `Date` header of every answer (errors included) feeds the clock.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const systemNowMs = options.systemNowMs ?? Date.now;
  const instance = axios.create({
    baseURL: `${options.baseUrl}${API_PREFIX}`,
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    headers: { Accept: 'application/json' },
    adapter: options.adapter,
  });

  async function request<T>(
    config: AxiosRequestConfig,
    requestOptions?: RequestOptions,
  ): Promise<T> {
    const headers: Record<string, string> = { ...requestOptions?.headers };
    const language = options.getLanguage?.();
    if (language) headers['Accept-Language'] = language;
    if (requestOptions?.authenticated !== false && options.getAuthToken) {
      const token = await options.getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const sentAtMs = systemNowMs();
    const reportClock = (responseHeaders: unknown) => {
      const dateHeader = readDateHeader(responseHeaders);
      const offset = measureClockOffset({ dateHeader, sentAtMs, receivedAtMs: systemNowMs() });
      if (offset !== null) options.onClockOffset?.(offset);
    };

    try {
      const response = await instance.request<T>({
        ...config,
        headers,
        params: requestOptions?.params,
        signal: requestOptions?.signal,
      });
      reportClock(response.headers);
      return response.data;
    } catch (caught) {
      if (axios.isAxiosError(caught) && caught.response) reportClock(caught.response.headers);
      const error = toApiClientError(caught);
      if (error instanceof ApiClientError) options.onError?.(error);
      throw error;
    }
  }

  return {
    get: (url, o) => request({ method: 'GET', url }, o),
    post: (url, data, o) => request({ method: 'POST', url, data }, o),
    put: (url, data, o) => request({ method: 'PUT', url, data }, o),
    patch: (url, data, o) => request({ method: 'PATCH', url, data }, o),
    delete: (url, o) => request({ method: 'DELETE', url }, o),
  };
}

function readDateHeader(headers: unknown): string | undefined {
  if (typeof headers !== 'object' || headers === null) return undefined;
  const get = (headers as { get?: (n: string) => unknown }).get;
  const value =
    typeof get === 'function'
      ? get.call(headers, 'date')
      : (headers as Record<string, unknown>).date;
  return typeof value === 'string' ? value : undefined;
}
