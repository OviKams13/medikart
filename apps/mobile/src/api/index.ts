/**
 * HTTP client and API access shared by the features. Types come from @medikart/shared.
 * 4.23: one client (Axios), typed errors, server clock, React Query setup.
 */
export { appConfigQueryKey, fetchAppConfig, useAppConfig } from './appConfig';
export {
  createApiClient,
  type ApiClient,
  type ApiClientOptions,
  type AuthTokenProvider,
  type RequestOptions,
} from './client';
export { createClock, measureClockOffset, parseHttpDate, type Clock } from './clock';
export { ApiConfigError, resolveApiBaseUrl } from './config';
export { ApiClientError, isApiError, type ApiErrorKind } from './errors';
export { createQueryClient, shouldRetry } from './queryClient';
export { ApiServicesProvider, useApiClient, useNow, type ApiServices } from './services';
export { useApiErrorMessage } from './useApiErrorMessage';
