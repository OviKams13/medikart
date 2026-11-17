import { createApiClient, type ApiClientOptions } from './client';
import { ApiClientError } from './errors';
import { errorBody, fakeAdapter, sequenceClock, type FakeReply } from './testUtils';

const BASE = 'http://10.0.2.2:8080';
const DATE_10_00_30 = 'Tue, 17 Nov 2026 10:00:30 GMT';
const at = (hh: number, mm: number, ss: number, ms = 0) => Date.UTC(2026, 10, 17, hh, mm, ss, ms);

function setup(
  reply: FakeReply | ((call: number) => FakeReply),
  options?: Partial<ApiClientOptions>,
) {
  const adapter = fakeAdapter(reply);
  const offsets: number[] = [];
  const errors: ApiClientError[] = [];
  const client = createApiClient({
    baseUrl: BASE,
    adapter,
    onClockOffset: (offset) => offsets.push(offset),
    onError: (error) => errors.push(error),
    // The phone sends at 10:00:00.000 and receives at 10:00:00.200.
    systemNowMs: sequenceClock(at(10, 0, 0), at(10, 0, 0, 200)),
    ...options,
  });
  return { client, adapter, offsets, errors };
}

async function failure(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('The request should have failed.');
}

describe('requests', () => {
  test('goes to the configured server under /api/v1 and returns the JSON body', async () => {
    const { client, adapter } = setup({ data: { minimumVersion: '0.0.1' } });
    await expect(client.get('/app-config')).resolves.toEqual({ minimumVersion: '0.0.1' });
    expect(adapter.calls[0].baseURL).toBe(`${BASE}/api/v1`);
    expect(adapter.calls[0].url).toBe('/app-config');
    expect(adapter.calls[0].method).toBe('get');
  });

  test('sends no Authorization header when no token provider is set (no fake token)', async () => {
    const { client, adapter } = setup({ data: {} });
    await client.get('/anything');
    expect(adapter.calls[0].headers.has('Authorization')).toBe(false);
  });

  test('the token hook point adds the Bearer token, except on public requests', async () => {
    const { client, adapter } = setup(
      { data: {} },
      { getAuthToken: async () => 'token-from-the-hook' },
    );
    await client.get('/users/me');
    await client.get('/app-config', { authenticated: false });
    expect(adapter.calls[0].headers.get('Authorization')).toBe('Bearer token-from-the-hook');
    expect(adapter.calls[1].headers.has('Authorization')).toBe(false);
  });

  test('no token from the provider: no header', async () => {
    const { client, adapter } = setup({ data: {} }, { getAuthToken: async () => null });
    await client.get('/users/me');
    expect(adapter.calls[0].headers.has('Authorization')).toBe(false);
  });

  test('sends the app language, query parameters and body', async () => {
    const { client, adapter } = setup({ data: {} }, { getLanguage: () => 'fr' });
    await client.post('/doctors/search', { q: 'a' }, { params: { page: 0 } });
    expect(adapter.calls[0].headers.get('Accept-Language')).toBe('fr');
    expect(adapter.calls[0].params).toEqual({ page: 0 });
    expect(adapter.calls[0].data).toBe(JSON.stringify({ q: 'a' }));
  });
});

describe('errors', () => {
  test('an error in the single format becomes a typed ApiClientError with code and traceId', async () => {
    const body = errorBody('SLOT_TAKEN', 'aaaabbbbccccddddeeeeffff00001111');
    const { client, errors } = setup({ status: 409, data: body });
    const error = await failure(client.get('/x'));
    expect(error).toBeInstanceOf(ApiClientError);
    const apiError = error as ApiClientError;
    expect(apiError.kind).toBe('api');
    expect(apiError.status).toBe(409);
    expect(apiError.code).toBe('SLOT_TAKEN');
    expect(apiError.apiError).toEqual(body);
    expect(apiError.traceId).toBe('aaaabbbbccccddddeeeeffff00001111');
    expect(errors).toEqual([apiError]);
  });

  test('the log message holds kind, status, code and traceId, never the server text', async () => {
    const { client } = setup({ status: 422, data: errorBody('VALIDATION_ERROR', 'trace-1') });
    const error = (await failure(client.get('/x'))) as ApiClientError;
    expect(error.message).toBe('API api 422 VALIDATION_ERROR traceId=trace-1');
    expect(error.message).not.toContain('Technical message');
  });

  test('an answer that is not in the error format is "unexpected", traceId from the header', async () => {
    const { client } = setup({
      status: 502,
      data: '<html>Bad gateway</html>',
      headers: { 'x-trace-id': 'from-header' },
    });
    const error = (await failure(client.get('/x'))) as ApiClientError;
    expect(error.kind).toBe('unexpected');
    expect(error.status).toBe(502);
    expect(error.code).toBeUndefined();
    expect(error.traceId).toBe('from-header');
  });

  test('a code unknown to this app version is kept as is', async () => {
    const { client } = setup({ status: 400, data: errorBody('BRAND_NEW_CODE') });
    const error = (await failure(client.get('/x'))) as ApiClientError;
    expect(error.kind).toBe('api');
    expect(error.apiError?.code).toBe('BRAND_NEW_CODE');
  });

  test('no connection becomes kind "network"', async () => {
    const { client } = setup({ networkError: true });
    const error = (await failure(client.get('/x'))) as ApiClientError;
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.kind).toBe('network');
    expect(error.status).toBeUndefined();
  });

  test('a timeout becomes kind "timeout"', async () => {
    const { client } = setup({ timeout: true });
    const error = (await failure(client.get('/x'))) as ApiClientError;
    expect(error.kind).toBe('timeout');
  });
});

describe('clock offset from the Date header', () => {
  test('phone behind the server: positive offset reported', async () => {
    const { client, offsets } = setup({ data: {}, headers: { date: DATE_10_00_30 } });
    await client.get('/health');
    expect(offsets).toEqual([30_400]);
  });

  test('phone ahead of the server: negative offset reported', async () => {
    const { client, offsets } = setup(
      { data: {}, headers: { date: DATE_10_00_30 } },
      { systemNowMs: sequenceClock(at(10, 5, 0), at(10, 5, 0, 200)) },
    );
    await client.get('/health');
    expect(offsets).toHaveLength(1);
    expect(offsets[0]).toBeLessThan(0);
    expect(offsets[0]).toBe(at(10, 0, 30, 500) - at(10, 5, 0, 100));
  });

  test('missing Date header: no offset reported, the request still works', async () => {
    const { client, offsets } = setup({ data: { ok: true } });
    await expect(client.get('/health')).resolves.toEqual({ ok: true });
    expect(offsets).toEqual([]);
  });

  test('unreadable Date header: no offset reported', async () => {
    const { client, offsets } = setup({ data: {}, headers: { date: 'not a date' } });
    await client.get('/health');
    expect(offsets).toEqual([]);
  });

  test('network error: no offset reported', async () => {
    const { client, offsets } = setup({ networkError: true });
    await failure(client.get('/health'));
    expect(offsets).toEqual([]);
  });

  test('an error answer from the server still carries the time', async () => {
    const { client, offsets } = setup({
      status: 401,
      data: errorBody('UNAUTHENTICATED'),
      headers: { date: DATE_10_00_30 },
    });
    await failure(client.get('/users/me'));
    expect(offsets).toEqual([30_400]);
  });
});
