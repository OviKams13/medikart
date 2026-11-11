// Reference tests of the datetime module (D1.5-11).
// Fixed instants and timezones, never the real clock. The three display bugs of the course app
// (reference images 14, 15, 16) are pinned here: they must stay impossible.
import { afterEach, describe, expect, it } from 'vitest';
import {
  formatCallLabel,
  formatCardDate,
  formatCountdown,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatTimeRange,
  formatTimeWithDoctorTime,
  formatTimer,
  getCallState,
  type Locale,
} from '..';

const LUBUMBASHI = 'Africa/Lubumbashi'; // UTC+2
const KINSHASA = 'Africa/Kinshasa'; // UTC+1

/** Thursday 5 March 2026, 14:30 in Lubumbashi. */
const APPOINTMENT = '2026-03-05T12:30:00Z';
const NOW = '2026-01-10T08:00:00Z';

describe('time: 24-hour clock, never AM/PM (D1.1-24, D1.5-06)', () => {
  it.each([
    ['Africa/Lubumbashi', '14:30'],
    ['Africa/Kinshasa', '13:30'],
    ['UTC', '12:30'],
    ['Pacific/Pago_Pago', '01:30'], // UTC-11
    ['Pacific/Kiritimati', '02:30'], // UTC+14
  ])('same instant in %s is %s', (timeZone, expected) => {
    expect(formatTime(APPOINTMENT, { locale: 'fr', timeZone })).toBe(expected);
    expect(formatTime(APPOINTMENT, { locale: 'en', timeZone })).toBe(expected);
  });

  it('image 16: a noon appointment shows 12:00, not 12:00 AM', () => {
    expect(formatTime('2026-03-05T10:00:00Z', { locale: 'en', timeZone: LUBUMBASHI })).toBe(
      '12:00',
    );
  });

  it('image 14: 13:00 is written 13:00, never "13:00 PM"', () => {
    const text = formatTime('2026-03-05T11:00:00Z', { locale: 'en', timeZone: LUBUMBASHI });
    expect(text).toBe('13:00');
    expect(text).not.toMatch(/AM|PM/i);
  });

  it('midnight is 00:00, never 24:00 or 12:00', () => {
    expect(formatTime('2026-03-04T22:00:00Z', { locale: 'fr', timeZone: LUBUMBASHI })).toBe(
      '00:00',
    );
    expect(formatTime('2026-03-04T22:59:00Z', { locale: 'fr', timeZone: LUBUMBASHI })).toBe(
      '00:59',
    );
    expect(formatTime('2026-03-05T21:59:00Z', { locale: 'fr', timeZone: LUBUMBASHI })).toBe(
      '23:59',
    );
  });

  it('range uses an en dash with spaces', () => {
    expect(
      formatTimeRange(APPOINTMENT, '2026-03-05T13:00:00Z', { locale: 'fr', timeZone: LUBUMBASHI }),
    ).toBe('14:30 – 15:00');
    expect(
      formatTimeRange('2026-03-05T21:30:00Z', '2026-03-05T22:00:00Z', {
        locale: 'en',
        timeZone: LUBUMBASHI,
      }),
    ).toBe('23:30 – 00:00');
  });
});

describe('long date: always with the year (D1.5-06)', () => {
  it('French and English examples of the report (§8.8)', () => {
    expect(formatLongDate(APPOINTMENT, { locale: 'fr', timeZone: LUBUMBASHI })).toBe(
      'jeudi 5 mars 2026 à 14:30',
    );
    expect(formatLongDate(APPOINTMENT, { locale: 'en', timeZone: LUBUMBASHI })).toBe(
      'Thursday 5 March 2026 at 14:30',
    );
  });

  it('image 15: the confirmation never shows a raw ISO date', () => {
    for (const locale of ['fr', 'en'] as Locale[]) {
      const text = formatLongDate('2026-03-05T10:00:00Z', { locale, timeZone: LUBUMBASHI });
      expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    }
    expect(formatLongDate('2026-03-05T10:00:00Z', { locale: 'fr', timeZone: LUBUMBASHI })).toBe(
      'jeudi 5 mars 2026 à 12:00',
    );
  });

  it('lowercase in the middle of a sentence, capital at the beginning of a line', () => {
    expect(formatLongDate(APPOINTMENT, { locale: 'fr', timeZone: LUBUMBASHI })).toMatch(/^jeudi/);
    expect(
      formatLongDate(APPOINTMENT, { locale: 'fr', timeZone: LUBUMBASHI, atLineStart: true }),
    ).toBe('Jeudi 5 mars 2026 à 14:30');
    expect(
      formatLongDate(APPOINTMENT, { locale: 'en', timeZone: LUBUMBASHI, atLineStart: true }),
    ).toBe('Thursday 5 March 2026 at 14:30');
  });

  it('is not relative, even for today', () => {
    expect(formatLongDate(APPOINTMENT, { locale: 'en', timeZone: LUBUMBASHI })).not.toMatch(
      /Today|Tomorrow|Yesterday/,
    );
  });
});

describe('short date: the year only when it differs from the current year (D1.5-06)', () => {
  const same = { timeZone: LUBUMBASHI, now: NOW };

  it('French and English examples of the report (§8.8)', () => {
    expect(formatShortDate(APPOINTMENT, { locale: 'fr', ...same })).toBe('5 mars · 14:30');
    expect(formatShortDate(APPOINTMENT, { locale: 'en', ...same })).toBe('5 Mar · 14:30');
  });

  it('adds the year for another year', () => {
    const next = { timeZone: LUBUMBASHI, now: '2025-06-01T08:00:00Z' };
    expect(formatShortDate(APPOINTMENT, { locale: 'fr', ...next })).toBe('5 mars 2026 · 14:30');
    expect(formatShortDate(APPOINTMENT, { locale: 'en', ...next })).toBe('5 Mar 2026 · 14:30');
  });

  it('compares the years in the display timezone (new year boundary)', () => {
    // 2025-12-31 23:30 UTC is already 1 January 2026 in Lubumbashi.
    const instant = '2025-12-31T23:30:00Z';
    const now = '2025-12-31T10:00:00Z';
    expect(formatShortDate(instant, { locale: 'en', timeZone: LUBUMBASHI, now })).toBe(
      '1 Jan 2026 · 01:30',
    );
    expect(formatShortDate(instant, { locale: 'en', timeZone: 'UTC', now })).toBe('31 Dec · 23:30');
  });

  it('uses the French abbreviations of the months', () => {
    const options = { locale: 'fr', timeZone: LUBUMBASHI, now: NOW } as const;
    expect(formatShortDate('2026-02-05T12:30:00Z', options)).toBe('5 févr. · 14:30');
    expect(formatShortDate('2026-08-05T12:30:00Z', options)).toBe('5 août · 14:30');
    expect(formatShortDate('2026-12-05T12:30:00Z', options)).toBe('5 déc. · 14:30');
  });
});

describe('relative days: cards and lists only (D1.5-05)', () => {
  // 08:00 in Lubumbashi on Thursday 5 March 2026.
  const now = '2026-03-05T06:00:00Z';
  const options = (locale: Locale) => ({ locale, timeZone: LUBUMBASHI, now });

  it('today, tomorrow, yesterday, in French and English', () => {
    expect(formatCardDate(APPOINTMENT, options('fr'))).toBe("Aujourd'hui · 14:30");
    expect(formatCardDate(APPOINTMENT, options('en'))).toBe('Today · 14:30');
    expect(formatCardDate('2026-03-06T07:00:00Z', options('fr'))).toBe('Demain · 09:00');
    expect(formatCardDate('2026-03-06T07:00:00Z', options('en'))).toBe('Tomorrow · 09:00');
    expect(formatCardDate('2026-03-04T07:00:00Z', options('fr'))).toBe('Hier · 09:00');
    expect(formatCardDate('2026-03-04T07:00:00Z', options('en'))).toBe('Yesterday · 09:00');
  });

  it('falls back to the short date from two days away', () => {
    expect(formatCardDate('2026-03-07T07:00:00Z', options('fr'))).toBe('7 mars · 09:00');
    expect(formatCardDate('2026-03-03T07:00:00Z', options('en'))).toBe('3 Mar · 09:00');
  });

  it('counts calendar days of the display timezone, not 24-hour blocks', () => {
    // 23:30 in Lubumbashi on 5 March; the appointment is an hour later, so 00:30 on 6 March.
    const lateNow = '2026-03-05T21:30:00Z';
    const instant = '2026-03-05T22:30:00Z';
    expect(formatCardDate(instant, { locale: 'en', timeZone: LUBUMBASHI, now: lateNow })).toBe(
      'Tomorrow · 00:30',
    );
    // In Kinshasa (UTC+1) both are still on 5 March.
    expect(formatCardDate(instant, { locale: 'en', timeZone: KINSHASA, now: lateNow })).toBe(
      'Today · 23:30',
    );
  });
});

describe('doctor time mentioned when the timezones differ (EF-14, §8.7)', () => {
  it('patient in Kinshasa, doctor in Lubumbashi', () => {
    expect(
      formatTimeWithDoctorTime(APPOINTMENT, {
        locale: 'en',
        patientTimeZone: KINSHASA,
        doctorTimeZone: LUBUMBASHI,
      }),
    ).toBe('13:30 (Lubumbashi time: 14:30)');
    expect(
      formatTimeWithDoctorTime(APPOINTMENT, {
        locale: 'fr',
        patientTimeZone: KINSHASA,
        doctorTimeZone: LUBUMBASHI,
      }),
    ).toBe('13:30 (heure de Lubumbashi : 14:30)');
  });

  it('nothing added when both are the same, and Lubumbashi is the default doctor timezone', () => {
    expect(
      formatTimeWithDoctorTime(APPOINTMENT, { locale: 'en', patientTimeZone: LUBUMBASHI }),
    ).toBe('14:30');
    expect(formatTimeWithDoctorTime(APPOINTMENT, { locale: 'en', patientTimeZone: 'UTC' })).toBe(
      '12:30 (Lubumbashi time: 14:30)',
    );
  });

  it('doctor in Kinshasa, patient in Lubumbashi', () => {
    expect(
      formatTimeWithDoctorTime(APPOINTMENT, {
        locale: 'en',
        patientTimeZone: LUBUMBASHI,
        doctorTimeZone: KINSHASA,
      }),
    ).toBe('14:30 (Kinshasa time: 13:30)');
  });
});

describe('call countdown labels (D1.5-07, EF-19)', () => {
  const call = { startAt: APPOINTMENT, endAt: '2026-03-05T13:00:00Z' };
  const label = (now: string, locale: Locale = 'en', timeZone = LUBUMBASHI) =>
    formatCallLabel({ ...call, now }, { locale, timeZone });

  it('another day: date and time when the call opens (5 minutes before the start)', () => {
    expect(label('2026-03-03T09:00:00Z').label).toBe('Call available on 5 March at 14:25');
    expect(label('2026-03-03T09:00:00Z', 'fr').label).toBe('Appel disponible le 5 mars à 14:25');
    expect(label('2026-03-03T09:00:00Z').state).toBe('upcoming');
  });

  it('same day: remaining time in hours and minutes, minutes, then seconds', () => {
    expect(label('2026-03-05T10:10:00Z').label).toBe('Call available in 2 h 15 min');
    expect(label('2026-03-05T10:10:00Z', 'fr').label).toBe('Appel disponible dans 2 h 15 min');
    expect(label('2026-03-05T12:13:00Z').label).toBe('Call available in 12 min');
    expect(label('2026-03-05T12:24:15Z').label).toBe('Call available in 45 s');
    expect(label('2026-03-05T12:24:15Z', 'fr').label).toBe('Appel disponible dans 45 s');
  });

  it('window open from 5 minutes before the start until 10 minutes after the end', () => {
    expect(label('2026-03-05T12:24:59.999Z').state).toBe('upcoming');
    expect(label('2026-03-05T12:25:00Z')).toEqual({
      state: 'open',
      label: 'Voice call · 14:30 – 15:00',
    });
    expect(label('2026-03-05T12:30:00Z', 'fr').label).toBe('Appel vocal · 14:30 – 15:00');
    expect(label('2026-03-05T13:10:00Z').state).toBe('open');
  });

  it('ended after the window', () => {
    expect(label('2026-03-05T13:10:00.001Z')).toEqual({ state: 'ended', label: 'Call ended' });
    expect(label('2026-03-06T09:00:00Z', 'fr').label).toBe('Appel terminé');
  });

  it('the same moment can be "another day" in one timezone and "same day" in another', () => {
    const late = { startAt: '2026-03-05T22:30:00Z', endAt: '2026-03-05T23:00:00Z' };
    const now = '2026-03-05T20:00:00Z';
    // Lubumbashi: opens 00:25 on 6 March, now is 22:00 on 5 March.
    expect(formatCallLabel({ ...late, now }, { locale: 'en', timeZone: LUBUMBASHI }).label).toBe(
      'Call available on 6 March at 00:25',
    );
    // Kinshasa: opens 23:25 on 5 March, now is 21:00 on 5 March.
    expect(formatCallLabel({ ...late, now }, { locale: 'en', timeZone: KINSHASA }).label).toBe(
      'Call available in 2 h 25 min',
    );
  });

  it('getCallState follows the window', () => {
    expect(getCallState({ ...call, now: '2026-03-05T11:00:00Z' })).toBe('upcoming');
    expect(getCallState({ ...call, now: '2026-03-05T12:45:00Z' })).toBe('open');
    expect(getCallState({ ...call, now: '2026-03-05T14:00:00Z' })).toBe('ended');
  });

  it('countdown never rounds up', () => {
    expect(formatCountdown(8_100_000)).toBe('2 h 15 min');
    expect(formatCountdown(7_200_000)).toBe('2 h');
    expect(formatCountdown(720_000)).toBe('12 min');
    expect(formatCountdown(719_999)).toBe('11 min');
    expect(formatCountdown(3_599_999)).toBe('59 min');
    expect(formatCountdown(59_999)).toBe('59 s');
    expect(formatCountdown(45_000)).toBe('45 s');
    expect(formatCountdown(0)).toBe('0 s');
    expect(formatCountdown(-5000)).toBe('0 s');
  });
});

describe('call timer: mm:ss then h:mm:ss (D1.1-31, EF-22)', () => {
  it.each([
    [0, '00:00'],
    [4.9, '00:04'],
    [277, '04:37'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3877, '1:04:37'],
    [36_000, '10:00:00'],
    [-3, '00:00'],
  ])('%s s is %s', (seconds, expected) => {
    expect(formatTimer(seconds)).toBe(expected);
  });

  it('refuses a number that is not finite', () => {
    expect(() => formatTimer(Number.NaN)).toThrow();
  });
});

describe('the output never depends on the phone timezone (D1.5-01)', () => {
  const original = process.env.TZ;
  afterEach(() => {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  });

  it.each([
    ['Pacific/Pago_Pago', '01:30'], // UTC-11
    ['Africa/Lubumbashi', '14:30'],
    ['Pacific/Kiritimati', '02:30'], // UTC+14
  ])('default display timezone %s gives %s', (tz, expected) => {
    process.env.TZ = tz;
    expect(formatTime(APPOINTMENT, { locale: 'fr' })).toBe(expected);
  });

  it('explicit timezones win over the phone timezone', () => {
    process.env.TZ = 'Pacific/Kiritimati';
    expect(formatLongDate(APPOINTMENT, { locale: 'en', timeZone: LUBUMBASHI })).toBe(
      'Thursday 5 March 2026 at 14:30',
    );
  });
});

describe('sweep: no AM/PM, no 24:xx, no raw ISO date, whatever the hour and the zone', () => {
  const zones = [LUBUMBASHI, KINSHASA, 'UTC', 'Pacific/Pago_Pago', 'Pacific/Kiritimati'];
  const base = Date.UTC(2026, 2, 5, 0, 0, 0);

  it('time and dates are always well formed', () => {
    for (const timeZone of zones) {
      for (const locale of ['fr', 'en'] as Locale[]) {
        for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
          const instant = new Date(base + minutes * 60_000);
          const time = formatTime(instant, { locale, timeZone });
          expect(time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
          for (const text of [
            formatLongDate(instant, { locale, timeZone }),
            formatShortDate(instant, { locale, timeZone, now: base }),
            formatCardDate(instant, { locale, timeZone, now: base }),
          ]) {
            expect(text).not.toMatch(/\b(AM|PM)\b/i);
            expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
            expect(text).not.toMatch(/\b24:\d\d/);
          }
        }
      }
    }
  });
});
