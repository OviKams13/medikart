/**
 * HTTP access to the backend (4.27: a typed GET and `/app-config`). Types come from @medikart/shared.
 * The authenticated client (Firebase token) comes with login, point 5.
 */
export {
  API_PREFIX,
  ApiRequestError,
  fetchAppConfig,
  getJson,
  resolveApiBaseUrl,
  useApiErrorMessage,
  useAppConfig,
  type ApiRequestErrorKind,
  type AsyncState,
} from './client';
