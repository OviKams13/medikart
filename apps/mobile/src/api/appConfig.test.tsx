import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppProviders } from '../app/AppProviders';
import { createAppServices } from '../app/services';
import { initI18n } from '../i18n';
import { useAppConfig } from './appConfig';
import { shouldRetry } from './queryClient';
import { ApiClientError } from './errors';
import { errorBody, fakeAdapter, type FakeReply } from './testUtils';
import { useApiErrorMessage } from './useApiErrorMessage';
import { useNow } from './services';
import { I18nextProvider } from 'react-i18next';
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';
import { changeLanguage } from '../i18n';

const DATE_10_00_30 = 'Tue, 17 Nov 2026 10:00:30 GMT';
const at = (hh: number, mm: number, ss: number, ms = 0) => Date.UTC(2026, 10, 17, hh, mm, ss, ms);

let latest: {
  query: ReturnType<typeof useAppConfig>;
  message: (error: unknown) => string;
  now: () => Date;
};

function Probe() {
  latest = { query: useAppConfig(), message: useApiErrorMessage(), now: useNow() };
  return null;
}

let cleanup: (() => Promise<void>) | undefined;

async function mount(reply: FakeReply | ((call: number) => FakeReply), systemNowMs?: () => number) {
  const adapter = fakeAdapter(reply);
  const services = createAppServices({
    baseUrl: 'http://10.0.2.2:8080',
    adapter,
    systemNowMs,
    queryRetryDelay: 0,
  });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <I18nextProvider i18n={initI18n()}>
        <AppProviders services={services}>
          <Probe />
        </AppProviders>
      </I18nextProvider>,
    );
  });
  // Let the query (and its retries) settle.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  cleanup = async () => {
    await act(async () => tree.unmount());
    services.queryClient.clear();
  };
  return { adapter, services, tree };
}

beforeEach(() => {
  // The app logs API errors in development: expected here.
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
  jest.restoreAllMocks();
  await act(() => changeLanguage('fr'));
});

describe('GET /api/v1/app-config through React Query', () => {
  test('returns the typed answer and calls the right URL without a token', async () => {
    const { adapter } = await mount({
      data: { minimumVersion: '0.0.1', legalLinks: {}, support: {} },
      headers: { date: DATE_10_00_30 },
    });
    expect(latest.query.data?.minimumVersion).toBe('0.0.1');
    expect(adapter.calls).toHaveLength(1);
    expect(adapter.calls[0].baseURL).toBe('http://10.0.2.2:8080/api/v1');
    expect(adapter.calls[0].url).toBe('/app-config');
    expect(adapter.calls[0].headers.has('Authorization')).toBe(false);
  });

  test('the Date header feeds the store and the corrected now() of the whole app', async () => {
    // Phone: sends 10:00:00.000, receives 10:00:00.200, then reads "now" at 10:00:05.
    const ticks = [at(10, 0, 0), at(10, 0, 0, 200), at(10, 0, 5)];
    let i = 0;
    const { services } = await mount(
      { data: { minimumVersion: '0.0.1' }, headers: { date: DATE_10_00_30 } },
      () => ticks[Math.min(i++, ticks.length - 1)],
    );
    expect(services.store.getState().clock.offsetMs).toBe(30_400);
    // Phone reads 10:00:05; corrected = 10:00:05 + 30.4 s
    expect(latest.now().getTime()).toBe(at(10, 0, 35, 400));
  });

  test('without a Date header the clock stays unmeasured and now() is the phone clock', async () => {
    const { services } = await mount({ data: { minimumVersion: '0.0.1' } }, () => at(10, 0, 5));
    expect(services.store.getState().clock.offsetMs).toBeNull();
    expect(latest.now().getTime()).toBe(at(10, 0, 5));
  });

  test('an API error is not retried and is shown through the translated code', async () => {
    const { adapter } = await mount({ status: 422, data: errorBody('VALIDATION_ERROR') });
    expect(adapter.calls).toHaveLength(1);
    expect(latest.query.error).toBeInstanceOf(ApiClientError);
    expect(latest.message(latest.query.error)).toBe(fr.errors.VALIDATION_ERROR);
    await act(() => changeLanguage('en'));
    expect(latest.message(latest.query.error)).toBe(en.errors.VALIDATION_ERROR);
    // The English server text never reaches the screen.
    expect(latest.message(latest.query.error)).not.toContain('Technical');
  });

  test('a network error is retried twice, then shown as "no connection"', async () => {
    const { adapter } = await mount({ networkError: true });
    expect(adapter.calls).toHaveLength(3);
    expect(latest.message(latest.query.error)).toBe(fr.errorsFallback.network);
  });

  test('a server error 5xx is retried, then recovers when the server answers', async () => {
    const { adapter } = await mount((call) =>
      call < 3
        ? { status: 503, data: errorBody('INTERNAL_ERROR') }
        : { data: { minimumVersion: '0.0.1' } },
    );
    expect(adapter.calls).toHaveLength(3);
    expect(latest.query.data?.minimumVersion).toBe('0.0.1');
  });

  test('an unknown or non-API error gets the generic text', async () => {
    await mount({ data: {} });
    expect(latest.message(new Error('boom'))).toBe(fr.errorsFallback.unknown);
    expect(latest.message(new ApiClientError({ kind: 'unexpected', status: 502 }))).toBe(
      fr.errorsFallback.unknown,
    );
  });
});

describe('retry rule', () => {
  const api = (status: number) => new ApiClientError({ kind: 'unexpected', status });
  test('only network, timeout and 5xx failures are retried, at most twice', () => {
    expect(shouldRetry(0, new ApiClientError({ kind: 'network' }))).toBe(true);
    expect(shouldRetry(1, new ApiClientError({ kind: 'timeout' }))).toBe(true);
    expect(shouldRetry(0, api(500))).toBe(true);
    expect(shouldRetry(2, api(500))).toBe(false);
    expect(shouldRetry(0, api(404))).toBe(false);
    expect(shouldRetry(0, api(429))).toBe(false);
    expect(shouldRetry(0, new Error('x'))).toBe(false);
  });
});
