import { describe, expect, test, vi } from 'vitest';
import { initI18n } from '../i18n';
import { ApiRequestError, fetchAppConfig, getJson, resolveApiBaseUrl } from './client';

initI18n('fr');

const reply = (body: unknown, status = 200) => vi.fn(async () => Response.json(body, { status }));

describe('getJson', () => {
  test('reads a JSON answer, calls /api/v1 and sends the language', async () => {
    const fetchImpl = reply({ minimumVersion: '0.0.1' });
    const data = await fetchAppConfig({ baseUrl: 'http://localhost:8080', fetchImpl });
    expect(data).toEqual({ minimumVersion: '0.0.1' });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:8080/api/v1/app-config');
    expect((init.headers as Record<string, string>)['Accept-Language']).toBe('fr');
    // Public route until login exists: no Authorization header.
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  test('an answer in the single error format is an api error with its code', async () => {
    const body = { code: 'SLOT_TAKEN', message: 'text', details: [], traceId: 't' };
    const error = await getJson('/x', { fetchImpl: reply(body, 409) }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ kind: 'api', status: 409 });
    expect((error as ApiRequestError).apiError?.code).toBe('SLOT_TAKEN');
    // No server text in the error message (it can reach logs).
    expect((error as ApiRequestError).message).toBe('api 409 SLOT_TAKEN');
  });

  test('an answer outside the error format is "unexpected", never a business error', async () => {
    const html = vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 }));
    const error = await getJson('/x', { fetchImpl: html }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'unexpected', status: 502 });
  });

  test('no connection is a network error', async () => {
    const down = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const error = await getJson('/x', { fetchImpl: down }).catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'network' });
  });

  test('base URL: empty in development, no trailing slash when set', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('');
    expect(resolveApiBaseUrl('https://api.example.org/')).toBe('https://api.example.org');
  });
});
