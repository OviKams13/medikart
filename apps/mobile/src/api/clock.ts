/**
 * Server clock (report §10.1 "Server time", D1.5-09, D1.7): the server is authoritative for time
 * and answers with a `Date` header on every response. The app measures the offset between that
 * header and the phone clock, and `now()` adds it, so countdowns and the call window are right
 * even on a phone whose clock is wrong.
 */

/** Samples whose round trip is longer than this are too imprecise and are ignored. */
export const MAX_ROUND_TRIP_MS = 5000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HTTP_DATE = /^[A-Za-z]{3}, (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/;

/**
 * Reads an HTTP date (`Tue, 17 Nov 2026 10:00:00 GMT`) into epoch milliseconds, or `null`.
 * Own strict parser: it does not depend on how the JavaScript engine (Hermes) parses date text.
 */
export function parseHttpDate(header: string | null | undefined): number | null {
  const match = typeof header === 'string' ? HTTP_DATE.exec(header.trim()) : null;
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month < 0) return null;
  const [day, year, hour, minute, second] = [match[1], match[3], match[4], match[5], match[6]].map(
    Number,
  );
  // Rejects impossible dates such as 31 Feb or 25:00: they would roll over to another moment.
  const daysInMonth = (Date.UTC(year, month + 1, 1) - Date.UTC(year, month, 1)) / 86_400_000;
  if (day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59) return null;
  return Date.UTC(year, month, day, hour, minute, second);
}

/**
 * Offset = server time - phone time, in milliseconds (positive: the phone is behind).
 * The header has a one-second resolution (it is truncated), so half a second is added; the server
 * wrote it about half way through the round trip. Precision: about a second, enough for countdowns.
 * Returns `null` when there is nothing usable: header missing or unreadable, or a round trip too
 * long. Times are the phone's own clock (`Date.now()`), never the corrected one.
 */
export function measureClockOffset(sample: {
  dateHeader: string | null | undefined;
  sentAtMs: number;
  receivedAtMs: number;
}): number | null {
  const serverMs = parseHttpDate(sample.dateHeader);
  if (serverMs === null) return null;
  const roundTrip = sample.receivedAtMs - sample.sentAtMs;
  if (roundTrip < 0 || roundTrip > MAX_ROUND_TRIP_MS) return null;
  const phoneAtServerMs = sample.sentAtMs + roundTrip / 2;
  return Math.round(serverMs + 500 - phoneAtServerMs);
}

export type Clock = {
  /** The corrected current time: pass it as `now` to the datetime module. */
  now(): Date;
  /** The same, in epoch milliseconds. */
  nowMs(): number;
};

/**
 * The single corrected clock of the app. Before any measurement the phone clock is used as is
 * (offset 0). `getOffsetMs` reads the offset kept in the store.
 */
export function createClock(
  getOffsetMs: () => number | null,
  systemNowMs: () => number = Date.now,
): Clock {
  const nowMs = () => systemNowMs() + (getOffsetMs() ?? 0);
  return { nowMs, now: () => new Date(nowMs()) };
}
