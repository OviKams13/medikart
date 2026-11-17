import { createClock, MAX_ROUND_TRIP_MS, measureClockOffset, parseHttpDate } from './clock';

const at = (hh: number, mm: number, ss: number, ms = 0) => Date.UTC(2026, 10, 17, hh, mm, ss, ms);
const HEADER_10_00_30 = 'Tue, 17 Nov 2026 10:00:30 GMT';

describe('parseHttpDate', () => {
  test('reads an HTTP date as UTC epoch milliseconds', () => {
    expect(parseHttpDate(HEADER_10_00_30)).toBe(at(10, 0, 30));
    expect(parseHttpDate('Sun, 31 Dec 2028 23:59:59 GMT')).toBe(Date.UTC(2028, 11, 31, 23, 59, 59));
  });

  test.each([
    undefined,
    null,
    '',
    'yesterday',
    '2026-11-17T10:00:30Z',
    'Tue, 17 Nov 2026 10:00:30 +0200',
    'Tue, 31 Feb 2026 10:00:30 GMT',
    'Tue, 17 Nov 2026 25:00:30 GMT',
    'Tue, 17 Foo 2026 10:00:30 GMT',
  ])('returns null for %p', (value) => {
    expect(parseHttpDate(value)).toBeNull();
  });
});

describe('measureClockOffset', () => {
  test('phone behind the server: positive offset', () => {
    // Phone says 10:00:00.000 -> 10:00:00.200; server header 10:00:30 (truncated to the second).
    const offset = measureClockOffset({
      dateHeader: HEADER_10_00_30,
      sentAtMs: at(10, 0, 0),
      receivedAtMs: at(10, 0, 0, 200),
    });
    // 30 s + 0.5 s (truncation) - 0.1 s (half the round trip) = 30.4 s
    expect(offset).toBe(30_400);
  });

  test('phone ahead of the server: negative offset', () => {
    const offset = measureClockOffset({
      dateHeader: HEADER_10_00_30,
      sentAtMs: at(10, 5, 0),
      receivedAtMs: at(10, 5, 0, 200),
    });
    // 10:00:30.5 server vs 10:05:00.1 phone
    expect(offset).toBe(at(10, 0, 30, 500) - at(10, 5, 0, 100));
    expect(offset).toBeLessThan(0);
  });

  test('phone on time: the offset stays within the one-second resolution of the header', () => {
    const offset = measureClockOffset({
      dateHeader: HEADER_10_00_30,
      sentAtMs: at(10, 0, 30, 300),
      receivedAtMs: at(10, 0, 30, 500),
    });
    expect(Math.abs(offset ?? Infinity)).toBeLessThanOrEqual(500);
  });

  test('missing or unreadable header: nothing measured', () => {
    const base = { sentAtMs: at(10, 0, 0), receivedAtMs: at(10, 0, 0, 100) };
    expect(measureClockOffset({ ...base, dateHeader: undefined })).toBeNull();
    expect(measureClockOffset({ ...base, dateHeader: 'garbage' })).toBeNull();
  });

  test('a round trip that is too long, or negative, is ignored', () => {
    const sentAtMs = at(10, 0, 0);
    expect(
      measureClockOffset({
        dateHeader: HEADER_10_00_30,
        sentAtMs,
        receivedAtMs: sentAtMs + MAX_ROUND_TRIP_MS + 1,
      }),
    ).toBeNull();
    expect(
      measureClockOffset({ dateHeader: HEADER_10_00_30, sentAtMs, receivedAtMs: sentAtMs - 1 }),
    ).toBeNull();
  });
});

describe('createClock', () => {
  test('uses the phone clock until an offset is measured', () => {
    const clock = createClock(
      () => null,
      () => at(10, 0, 0),
    );
    expect(clock.nowMs()).toBe(at(10, 0, 0));
    expect(clock.now().getTime()).toBe(at(10, 0, 0));
  });

  test('adds the measured offset, ahead or behind, and follows later measurements', () => {
    let offset: number | null = 30_000;
    const clock = createClock(
      () => offset,
      () => at(10, 0, 0),
    );
    expect(clock.nowMs()).toBe(at(10, 0, 30));
    offset = -60_000;
    expect(clock.now().getTime()).toBe(at(9, 59, 0));
  });
});
