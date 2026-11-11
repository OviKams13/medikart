import type { TimeZone } from './types';

/** The two timezones of the DRC, without daylight saving time (report §8.7). */
export const DRC_TIME_ZONES = {
  kinshasa: 'Africa/Kinshasa', // UTC+1
  lubumbashi: 'Africa/Lubumbashi', // UTC+2
} as const;

/** Default timezone of clinics and doctors (report §8.7). */
export const DEFAULT_CLINIC_TIME_ZONE: TimeZone = DRC_TIME_ZONES.lubumbashi;

/** The week starts on Monday everywhere (D1.1-23). */
export const WEEK_STARTS_ON_MONDAY = true;

/** The call window opens 5 minutes before the start (EF-22). */
export const CALL_OPENS_BEFORE_START_MIN = 5;

/** The call window closes 10 minutes after the end (EF-22). */
export const CALL_CLOSES_AFTER_END_MIN = 10;
