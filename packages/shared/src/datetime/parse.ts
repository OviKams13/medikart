import dayjs, { type Dayjs } from './dayjs';
import {
  InvalidDateTimeError,
  type InstantInput,
  type LocalDate,
  type LocalTime,
  type TimeZone,
} from './types';

const INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** The timezone of the phone, where times are displayed (report §8.7). */
export function getDeviceTimeZone(): TimeZone {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function assertTimeZone(timeZone: TimeZone): void {
  try {
    new Intl.DateTimeFormat('en', { timeZone });
  } catch {
    throw new InvalidDateTimeError(`Unknown timezone: ${timeZone}`);
  }
}

/** Reads an instant. A string must be strict ISO 8601 with `Z` or an offset. */
export function toDate(input: InstantInput): Date {
  let date: Date;
  if (typeof input === 'string') {
    if (!INSTANT_PATTERN.test(input)) {
      throw new InvalidDateTimeError(`Not an ISO instant: ${input}`);
    }
    date = new Date(input);
  } else if (input instanceof Date) {
    date = new Date(input.getTime());
  } else {
    date = new Date(input);
  }
  if (Number.isNaN(date.getTime())) {
    throw new InvalidDateTimeError('Invalid instant');
  }
  return date;
}

/** The instant seen in a timezone. Internal: dayjs objects never leave the module. */
export function inZone(input: InstantInput, timeZone: TimeZone): Dayjs {
  assertTimeZone(timeZone);
  return dayjs(toDate(input)).tz(timeZone);
}

function parseLocalDateParts(value: LocalDate): [number, number, number] {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) {
    throw new InvalidDateTimeError(`Not a local date (YYYY-MM-DD): ${value}`);
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])] as [
    number,
    number,
    number,
  ];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new InvalidDateTimeError(`Not a real calendar day: ${value}`);
  }
  return [year, month, day];
}

export function isLocalDate(value: string): boolean {
  try {
    parseLocalDateParts(value);
    return true;
  } catch {
    return false;
  }
}

export function isLocalTime(value: string): boolean {
  return LOCAL_TIME_PATTERN.test(value);
}

export function assertLocalDate(value: LocalDate): void {
  parseLocalDateParts(value);
}

export function assertLocalTime(value: LocalTime): void {
  if (!isLocalTime(value)) {
    throw new InvalidDateTimeError(`Not a local time (HH:mm): ${value}`);
  }
}

/** Calendar days since 1970-01-01, to compare days without any timezone effect. */
export function dayNumber(value: LocalDate): number {
  const [year, month, day] = parseLocalDateParts(value);
  return Math.round(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function localDateFromParts(year: number, month: number, day: number): LocalDate {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** The calendar day (`YYYY-MM-DD`) of an instant in a timezone. */
export function toLocalDate(input: InstantInput, timeZone: TimeZone): LocalDate {
  return inZone(input, timeZone).format('YYYY-MM-DD');
}

/** A day and a time in a timezone (for example a slot of the doctor) turned into an instant. */
export function localToInstant(date: LocalDate, time: LocalTime, timeZone: TimeZone): Date {
  assertLocalDate(date);
  assertLocalTime(time);
  assertTimeZone(timeZone);
  return dayjs.tz(`${date} ${time}`, timeZone).toDate();
}

/** API format of an instant: UTC, ISO, `Z`, milliseconds only when not zero (ERD §1). */
export function toApiInstant(input: InstantInput): string {
  const date = toDate(input);
  const base = dayjs.utc(date).format('YYYY-MM-DDTHH:mm:ss');
  const ms = date.getUTCMilliseconds();
  return ms === 0 ? `${base}Z` : `${base}.${pad(ms, 3)}Z`;
}
