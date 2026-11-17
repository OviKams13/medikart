import type { AxiosAdapter } from 'axios';
import {
  createApiClient,
  createClock,
  createQueryClient,
  resolveApiBaseUrl,
  type ApiClientError,
} from '../api';
import { i18next } from '../i18n';
import { clockOffsetMeasured, createAppStore } from './store';

function logApiError(error: ApiClientError) {
  // Message = kind, status, code and traceId only: no personal data, no server text.
  // The error tracker (Sentry) replaces this at its own point.
  if (__DEV__) console.warn(`[api] ${error.message}`);
}

export type AppServicesOptions = {
  baseUrl?: string;
  /** Tests give a fake network layer. */
  adapter?: AxiosAdapter;
  systemNowMs?: () => number;
  queryRetryDelay?: number;
};

/**
 * Builds everything the app shares: the store, the corrected clock, the HTTP client and the query
 * cache, wired together. The client reports every measured clock offset to the store, and the
 * clock reads it back: one source of time for the whole app.
 */
export function createAppServices(options: AppServicesOptions = {}) {
  const store = createAppStore();
  const clock = createClock(() => store.getState().clock.offsetMs, options.systemNowMs);
  const client = createApiClient({
    baseUrl: options.baseUrl ?? resolveApiBaseUrl(),
    getLanguage: () => i18next.language,
    onClockOffset: (offsetMs) => store.dispatch(clockOffsetMeasured(offsetMs)),
    onError: logApiError,
    adapter: options.adapter,
    systemNowMs: options.systemNowMs,
  });
  const queryClient = createQueryClient({ retryDelay: options.queryRetryDelay });
  return { store, clock, client, queryClient };
}

export type AppServices = ReturnType<typeof createAppServices>;
