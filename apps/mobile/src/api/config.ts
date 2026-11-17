/** Path prefix of every route of the backend (report §10.1). */
export const API_PREFIX = '/api/v1';

/**
 * The Android emulator reaches the computer's localhost at 10.0.2.2. Cleartext HTTP is allowed
 * for debug builds only (React Native's Gradle plugin sets `usesCleartextTraffic` per build type).
 * Dev only: a physical phone needs `adb reverse tcp:8080 tcp:8080` and a different URL (4.29).
 */
export const DEV_API_BASE_URL = 'http://10.0.2.2:8080';

/**
 * Backend URL of release builds (HTTPS, report §10.1). Not known yet: staging and production
 * servers and the domain come at points 15.8 and 17. A release build refuses to start until set.
 */
export const RELEASE_API_BASE_URL = '';

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigError';
  }
}

/** The one place that knows where the backend is. Never a secret: a public address only. */
export function resolveApiBaseUrl(
  isDev: boolean = __DEV__,
  releaseUrl: string = RELEASE_API_BASE_URL,
): string {
  const url = isDev ? DEV_API_BASE_URL : releaseUrl;
  if (!url) {
    throw new ApiConfigError(
      'The API base URL is not configured for release builds (see src/api/config.ts).',
    );
  }
  if (!isDev && !url.startsWith('https://')) {
    throw new ApiConfigError('The API base URL of a release build must use HTTPS.');
  }
  return url.replace(/\/+$/, '');
}
