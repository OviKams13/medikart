// Monday-first calendar (D1.1-23) and civil dates (D1.5-02, D1.5-03).
import { afterEach, describe, expect, it } from 'vitest';
import {
  addLocalDays,
  formatLocalDate,
  formatMonthTitle,
  getMonthGrid,
  getWeekdayIndex,
  getWeekdayLabels,
  InvalidDateTimeError,
  isLocalDate,
  isLocalTime,
  localToInstant,
  toApiInstant,
  toLocalDate,
  formatLocalTime,
  formatTime,
} from '..';

describe('calendar starts on Monday (image 14: Sunday-first is a bug)', () => {
  it('weekday labels begin with Monday and end with Sunday', () => {
    expect(getWeekdayLabels('en')).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
    expect(getWeekdayLabels('fr')).toEqual(['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']);
  });

  it('weekday index: Monday = 0, Sunday = 6', () => {
    expect(getWeekdayIndex('2026-03-02')).toBe(0); // Monday
    expect(getWeekdayIndex('2026-03-05')).toBe(3); // Thursday
    expect(getWeekdayIndex('2026-03-08')).toBe(6); // Sunday
    expect(getWeekdayIndex('1969-12-29')).toBe(0); // before 1970, a Monday
  });

  it('February 2025 (the month of the course screenshot) starts on Monday 27 January', () => {
    const grid = getMonthGrid(2025, 2);
    expect(grid).toHaveLength(5);
    expect(grid[0]).toEqual([
      '2025-01-27',
      '2025-01-28',
      '2025-01-29',
      '2025-01-30',
      '2025-01-31',
      '2025-02-01',
      '2025-02-02',
    ]);
    expect(grid[4]?.[6]).toBe('2025-03-02');
  });

  it('March 2026 begins on a Sunday: six weeks, the first one starts on 23 February', () => {
    const grid = getMonthGrid(2026, 3);
    expect(grid).toHaveLength(6);
    expect(grid[0]?.[0]).toBe('2026-02-23');
    expect(grid[0]?.[6]).toBe('2026-03-01');
  });

  it('every grid of 2026 and of the leap year 2028 is well formed', () => {
    for (const year of [2026, 2028]) {
      for (let month = 1; month <= 12; month += 1) {
        const grid = getMonthGrid(year, month);
        const days = grid.flat();
        expect(days.length % 7).toBe(0);
        for (const week of grid) {
          expect(week).toHaveLength(7);
          expect(getWeekdayIndex(week[0] as string)).toBe(0);
          expect(getWeekdayIndex(week[6] as string)).toBe(6);
        }
        // consecutive days, no gap, no duplicate
        days.slice(1).forEach((day, i) => expect(day).toBe(addLocalDays(days[i] as string, 1)));
        // every day of the month is there
        const prefix = `${year}-${String(month).padStart(2, '0')}-`;
        const inMonth = days.filter((d) => d.startsWith(prefix));
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        expect(inMonth).toHaveLength(daysInMonth);
        expect(inMonth[0]).toBe(`${prefix}01`);
      }
    }
    expect(getMonthGrid(2028, 2).flat()).toContain('2028-02-29');
    expect(getMonthGrid(2026, 2).flat()).not.toContain('2026-02-29');
  });

  it('refuses an invalid month', () => {
    expect(() => getMonthGrid(2026, 0)).toThrow(InvalidDateTimeError);
    expect(() => getMonthGrid(2026, 13)).toThrow(InvalidDateTimeError);
  });

  it('month title starts a line, so it has a capital', () => {
    expect(formatMonthTitle(2025, 2, 'fr')).toBe('Février 2025');
    expect(formatMonthTitle(2025, 2, 'en')).toBe('February 2025');
  });
});

describe('civil dates and times are never converted into instants (D1.5-02)', () => {
  const original = process.env.TZ;
  afterEach(() => {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  });

  it.each(['Pacific/Pago_Pago', 'Africa/Lubumbashi', 'Pacific/Kiritimati'])(
    'a local date shows the same day when the phone is in %s',
    (tz) => {
      process.env.TZ = tz;
      expect(formatLocalDate('2026-03-05', { locale: 'fr' })).toBe('jeudi 5 mars 2026');
      expect(formatLocalDate('2026-03-05', { locale: 'en' })).toBe('Thursday 5 March 2026');
      expect(formatLocalDate('2026-03-05', { locale: 'fr', atLineStart: true })).toBe(
        'Jeudi 5 mars 2026',
      );
    },
  );

  it('validates the formats', () => {
    expect(isLocalDate('2026-03-05')).toBe(true);
    expect(isLocalDate('2028-02-29')).toBe(true);
    expect(isLocalDate('2026-02-29')).toBe(false);
    expect(isLocalDate('2026-02-30')).toBe(false);
    expect(isLocalDate('2026-3-5')).toBe(false);
    expect(isLocalDate('2026-03-05T12:00:00Z')).toBe(false);
    expect(isLocalTime('14:30')).toBe(true);
    expect(isLocalTime('00:00')).toBe(true);
    expect(isLocalTime('23:59')).toBe(true);
    expect(isLocalTime('24:00')).toBe(false);
    expect(isLocalTime('9:30')).toBe(false);
    expect(isLocalTime('14:30:00')).toBe(false);
    expect(formatLocalTime('00:00')).toBe('00:00');
    expect(() => formatLocalTime('2:30 PM')).toThrow(InvalidDateTimeError);
  });
});

describe('days of the doctor, instants for the server (D1.5-03, ERD §1)', () => {
  it('a slot of the doctor becomes the right instant', () => {
    expect(toApiInstant(localToInstant('2026-03-05', '14:30', 'Africa/Lubumbashi'))).toBe(
      '2026-03-05T12:30:00Z',
    );
    expect(toApiInstant(localToInstant('2026-03-05', '14:30', 'Africa/Kinshasa'))).toBe(
      '2026-03-05T13:30:00Z',
    );
    expect(toApiInstant(localToInstant('2026-03-05', '00:00', 'Africa/Lubumbashi'))).toBe(
      '2026-03-04T22:00:00Z',
    );
  });

  it('the day of an instant depends on the timezone of the doctor', () => {
    const instant = '2026-03-05T22:30:00Z';
    expect(toLocalDate(instant, 'Africa/Lubumbashi')).toBe('2026-03-06');
    expect(toLocalDate(instant, 'Africa/Kinshasa')).toBe('2026-03-05');
  });

  it('API instants are UTC with Z, milliseconds only when not zero', () => {
    expect(toApiInstant(new Date(Date.UTC(2026, 2, 5, 12, 30, 0)))).toBe('2026-03-05T12:30:00Z');
    expect(toApiInstant(new Date(Date.UTC(2026, 2, 5, 12, 30, 0, 123)))).toBe(
      '2026-03-05T12:30:00.123Z',
    );
    expect(toApiInstant(new Date(Date.UTC(2026, 2, 5, 12, 30, 0, 5)))).toBe(
      '2026-03-05T12:30:00.005Z',
    );
    // an offset is converted to UTC, like the backend does
    expect(toApiInstant('2026-03-05T14:30:00+02:00')).toBe('2026-03-05T12:30:00Z');
  });

  it('round trip: a string from the API is the same instant once sent back', () => {
    for (const text of ['2026-10-02T12:30:00Z', '2026-10-02T12:30:00.250Z']) {
      expect(toApiInstant(text)).toBe(text);
    }
  });
});

describe('invalid input is refused, never guessed', () => {
  it.each(['2026-03-05', '14:30', 'garbage', '2026-03-05 12:30:00', '2026-03-05T12:30:00'])(
    'instant %j is refused',
    (input) => {
      expect(() => toApiInstant(input)).toThrow(InvalidDateTimeError);
      expect(() => formatTime(input, { locale: 'fr', timeZone: 'UTC' })).toThrow(
        InvalidDateTimeError,
      );
    },
  );

  it('an invalid Date and an unknown timezone are refused', () => {
    expect(() => toApiInstant(new Date('nope'))).toThrow(InvalidDateTimeError);
    expect(() =>
      formatTime('2026-03-05T12:30:00Z', { locale: 'fr', timeZone: 'Mars/Olympus' }),
    ).toThrow(InvalidDateTimeError);
  });
});
