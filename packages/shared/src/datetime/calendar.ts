import dayjs from './dayjs';
import { capitalizeFirst } from './format';
import { dayNumber, localDateFromParts } from './parse';
import { InvalidDateTimeError, type LocalDate, type Locale } from './types';

/** Weekday headers of the booking calendar, MONDAY FIRST (D1.1-23). */
export function getWeekdayLabels(locale: Locale): string[] {
  return locale === 'fr'
    ? ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
}

/** Position of a day in a Monday-first week: Monday = 0 … Sunday = 6. */
export function getWeekdayIndex(date: LocalDate): number {
  // 1970-01-01 was a Thursday (index 3).
  return (((dayNumber(date) + 3) % 7) + 7) % 7;
}

/** Adds (or removes) calendar days to a civil date. No timezone involved. */
export function addLocalDays(date: LocalDate, days: number): LocalDate {
  const utc = new Date((dayNumber(date) + days) * 86_400_000);
  return localDateFromParts(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

/**
 * The weeks displayed for a month, Monday first. Each week has 7 days (`YYYY-MM-DD`),
 * including the days of the neighbouring months that complete the first and last week.
 * `month` goes from 1 to 12.
 */
export function getMonthGrid(year: number, month: number): LocalDate[][] {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new InvalidDateTimeError(`Invalid month: ${year}-${month}`);
  }
  const first = localDateFromParts(year, month, 1);
  const lastMonthKey = first.slice(0, 7);
  let cursor = addLocalDays(first, -getWeekdayIndex(first));
  const weeks: LocalDate[][] = [];
  do {
    const week: LocalDate[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(cursor);
      cursor = addLocalDays(cursor, 1);
    }
    weeks.push(week);
  } while (cursor.slice(0, 7) <= lastMonthKey);
  return weeks;
}

/** Month title of the calendar: `Février 2025` / `February 2025`. Starts a line: capital. */
export function formatMonthTitle(year: number, month: number, locale: Locale): string {
  const first = localDateFromParts(year, month, 1);
  return capitalizeFirst(dayjs.utc(`${first}T12:00:00Z`).locale(locale).format('MMMM YYYY'));
}
