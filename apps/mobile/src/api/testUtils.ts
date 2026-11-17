import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

/** Test helpers: a fake network layer for the HTTP client. Not used by the app. */
export type FakeReply =
  | { status?: number; data?: unknown; headers?: Record<string, string> }
  | { networkError: true }
  | { timeout: true };

export type FakeAdapter = AxiosAdapter & { calls: InternalAxiosRequestConfig[] };

/** Answers every request with `reply` (or the result of a function of the call number). */
export function fakeAdapter(reply: FakeReply | ((call: number) => FakeReply)): FakeAdapter {
  const calls: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    calls.push(config);
    const current = typeof reply === 'function' ? reply(calls.length) : reply;
    if ('networkError' in current) {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
    }
    if ('timeout' in current) {
      throw new AxiosError('timeout', AxiosError.ECONNABORTED, config);
    }
    const status = current.status ?? 200;
    const response = {
      data: current.data,
      status,
      statusText: String(status),
      headers: new AxiosHeaders(current.headers),
      config,
      request: {},
    };
    if (status >= 400) {
      throw new AxiosError(
        `Request failed with status code ${status}`,
        AxiosError.ERR_BAD_RESPONSE,
        config,
        null,
        response,
      );
    }
    return response;
  };
  return Object.assign(adapter, { calls });
}

/** A phone clock that returns the given instants one after the other (send time, receive time). */
export function sequenceClock(...values: number[]): () => number {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

/** An error body in the single error format of the backend (report §10.1). */
export function errorBody(code: string, traceId = '0123456789abcdef0123456789abcdef') {
  return { code, message: 'Technical message in English', details: [], traceId };
}
