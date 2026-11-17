import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from './errors';

const MAX_RETRIES = 2;

/**
 * Retry rule: only failures that may pass by themselves (no connection, timeout, server error
 * 5xx), at most twice. A 4xx answer is final: the same request would fail the same way.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!(error instanceof ApiClientError)) return false;
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.status !== undefined && error.status >= 500;
}

/** Server data cache (React Query, report §13). Built once by the app, once per test. */
export function createQueryClient(options?: { retryDelay?: number }) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay: options?.retryDelay,
        staleTime: 30_000,
      },
    },
  });
}
