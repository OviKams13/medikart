import { DEFAULT_CLINIC_TIME_ZONE } from './constants';
import {
  assertLocalDate,
  assertLocalTime,
  dayNumber,
  getDeviceTimeZone,
  inZone,
  pad,
  toDate,
} from './parse';
import type { InstantInput, Locale, LocalDate, LocalTime, TimeZone } from './types';

/** Display options. `timeZone` is the phone's timezone unless a screen says otherwise. */
export interface DisplayOptions {
  locale: Locale;
  timeZone?: TimeZone;
}

/** Options of the formats that depend on the current day (year rule, relative days). */
export interface DisplayNowOptions extends DisplayOptions {
  /** The current instant, already corrected with the server offset (D1.5-09). */
  now: InstantInput;
}

const SEPARATOR = ' · ';
const RANGE_DASH = ' – ';
const NBSP = ' ';

const WORDS = {
  fr: { at: 'à', today: "Aujourd'hui", tomorrow: 'Demain', yesterday: 'Hier' },
  en: { at: 'at', today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' },
} as const;

function zoneOf(options: DisplayOptions): TimeZone {
  return options.timeZone ?? getDeviceTimeZone();
}

/** Uppercase the first letter: for text at the beginning of a line (D1.5-06). */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** `14:30`. 24-hour clock, midnight is `00:00`, never AM/PM. */
export function formatTime(instant: InstantInput, options: DisplayOptions): string {
  return inZone(instant, zoneOf(options)).format('HH:mm');
}

/** `14:30 – 15:00`. */
export function formatTimeRange(
  start: InstantInput,
  end: InstantInput,
  options: DisplayOptions,
): string {
  return `${formatTime(start, options)}${RANGE_DASH}${formatTime(end, options)}`;
}

export interface LongDateOptions extends DisplayOptions {
  /** True when the text starts a line: the first letter is a capital (D1.5-06). */
  atLineStart?: boolean;
}

/**
 * Long date, always with the year (confirmation, detail):
 * `jeudi 5 mars 2026 à 14:30` / `Thursday 5 March 2026 at 14:30`.
 * Never relative. In French the weekday is lowercase in the middle of a sentence.
 */
export function formatLongDate(instant: InstantInput, options: LongDateOptions): string {
  const text = inZone(instant, zoneOf(options))
    .locale(options.locale)
    .format(`dddd D MMMM YYYY [${WORDS[options.locale].at}] HH:mm`);
  return options.atLineStart ? capitalizeFirst(text) : text;
}

/** Long date without time: `jeudi 5 mars 2026` / `Thursday 5 March 2026`. */
export function formatLongDay(instant: InstantInput, options: LongDateOptions): string {
  const text = inZone(instant, zoneOf(options)).locale(options.locale).format('dddd D MMMM YYYY');
  return options.atLineStart ? capitalizeFirst(text) : text;
}

function sameYear(instant: InstantInput, options: DisplayNowOptions): boolean {
  const zone = zoneOf(options);
  return inZone(instant, zone).year() === inZone(options.now, zone).year();
}

/**
 * Short date (cards, lists): `5 mars · 14:30` / `5 Mar · 14:30`.
 * The year is added only when it differs from the current year.
 */
export function formatShortDate(instant: InstantInput, options: DisplayNowOptions): string {
  const yearPart = sameYear(instant, options) ? '' : ' YYYY';
  const day = inZone(instant, zoneOf(options)).locale(options.locale).format(`D MMM${yearPart}`);
  return `${day}${SEPARATOR}${formatTime(instant, options)}`;
}

export type RelativeDay = 'today' | 'tomorrow' | 'yesterday';

/** Which relative day an instant falls on, by calendar days in the display timezone. */
export function getRelativeDay(
  instant: InstantInput,
  options: DisplayNowOptions,
): RelativeDay | null {
  const zone = zoneOf(options);
  const diff =
    dayNumber(inZone(instant, zone).format('YYYY-MM-DD')) -
    dayNumber(inZone(options.now, zone).format('YYYY-MM-DD'));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  return null;
}

/**
 * Date of a card or a list row (D1.5-05): `Aujourd'hui · 14:30`, `Demain · 09:00`,
 * `Hier · 09:00`, otherwise the short date. Relative days exist ONLY here.
 */
export function formatCardDate(instant: InstantInput, options: DisplayNowOptions): string {
  const relative = getRelativeDay(instant, options);
  if (relative === null) return formatShortDate(instant, options);
  return `${WORDS[options.locale][relative]}${SEPARATOR}${formatTime(instant, options)}`;
}

function cityOf(timeZone: TimeZone): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');
}

export interface DoctorTimeOptions {
  locale: Locale;
  /** Phone timezone; defaults to the device's. */
  patientTimeZone?: TimeZone;
  /** Doctor's timezone; defaults to the clinic default (`Africa/Lubumbashi`). */
  doctorTimeZone?: TimeZone;
}

/**
 * Time in the patient's timezone, plus the doctor's time when the two differ at that instant:
 * `14:30` or `14:30 (Lubumbashi time: 14:00)` / `14:30 (heure de Lubumbashi : 14:00)`.
 */
export function formatTimeWithDoctorTime(
  instant: InstantInput,
  options: DoctorTimeOptions,
): string {
  const patientZone = options.patientTimeZone ?? getDeviceTimeZone();
  const doctorZone = options.doctorTimeZone ?? DEFAULT_CLINIC_TIME_ZONE;
  const patientTime = inZone(instant, patientZone);
  const doctorTime = inZone(instant, doctorZone);
  const own = patientTime.format('HH:mm');
  if (patientTime.utcOffset() === doctorTime.utcOffset()) return own;
  const city = cityOf(doctorZone);
  const doctorHour = doctorTime.format('HH:mm');
  const mention =
    options.locale === 'fr'
      ? `heure de ${city}${NBSP}: ${doctorHour}`
      : `${city} time: ${doctorHour}`;
  return `${own} (${mention})`;
}

/** A booked day alone: `jeudi 5 mars 2026` from `2026-03-05` (no instant, no timezone). */
export function formatLocalDate(
  date: LocalDate,
  options: { locale: Locale; atLineStart?: boolean },
): string {
  assertLocalDate(date);
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  // Noon UTC avoids any day shift: only the calendar day is displayed.
  const noon = toDate(`${pad(year, 4)}-${pad(month)}-${pad(day)}T12:00:00Z`);
  const text = inZone(noon, 'UTC').locale(options.locale).format('dddd D MMMM YYYY');
  return options.atLineStart ? capitalizeFirst(text) : text;
}

/** A civil time as written: validated and returned as `HH:mm`. */
export function formatLocalTime(time: LocalTime): string {
  assertLocalTime(time);
  return time;
}
