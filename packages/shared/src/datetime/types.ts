/** Languages of the app (report §8.9). French is the default. */
export type Locale = 'fr' | 'en';

/** An instant given as an API string (`2026-10-02T12:30:00Z`), a `Date` or epoch milliseconds. */
export type InstantInput = string | Date | number;

/** A calendar day without time, `YYYY-MM-DD` (D1.5-02). Never converted into an instant. */
export type LocalDate = string;

/** A clock time without date, `HH:mm` (D1.5-02). */
export type LocalTime = string;

/** An IANA timezone name, for example `Africa/Lubumbashi`. */
export type TimeZone = string;

/** Thrown when a date, a time, an instant or a timezone is not valid. */
export class InvalidDateTimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateTimeError';
  }
}
