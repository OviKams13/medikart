import { ApiConfigError, DEV_API_BASE_URL, resolveApiBaseUrl } from './config';

describe('resolveApiBaseUrl', () => {
  test('development: the backend of the Android emulator', () => {
    expect(resolveApiBaseUrl(true)).toBe('http://10.0.2.2:8080');
    expect(DEV_API_BASE_URL).toBe('http://10.0.2.2:8080');
  });

  test('release: refuses to start while no URL is configured', () => {
    expect(() => resolveApiBaseUrl(false, '')).toThrow(ApiConfigError);
  });

  test('release: HTTPS only, trailing slash removed', () => {
    expect(() => resolveApiBaseUrl(false, 'http://example.test')).toThrow(ApiConfigError);
    expect(resolveApiBaseUrl(false, 'https://example.test/')).toBe('https://example.test');
  });
});
