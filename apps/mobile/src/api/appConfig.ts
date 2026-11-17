import type { AppConfigResponse } from '@medikart/shared';
import { useQuery } from '@tanstack/react-query';
import type { ApiClient } from './client';
import { useApiClient } from './services';

export const appConfigQueryKey = ['app-config'] as const;

/** `GET /api/v1/app-config` (public): minimum version, legal links, support contact. */
export function fetchAppConfig(client: ApiClient, signal?: AbortSignal) {
  return client.get<AppConfigResponse>('/app-config', { signal, authenticated: false });
}

/**
 * The app config through React Query. 4.23 proves the chain with it; the forced-update check
 * (Update screen) is built on it at 4.25.
 */
export function useAppConfig() {
  const client = useApiClient();
  return useQuery({
    queryKey: appConfigQueryKey,
    queryFn: ({ signal }) => fetchAppConfig(client, signal),
  });
}
