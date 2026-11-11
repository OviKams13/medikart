import { CALL_CLOSES_AFTER_END_MIN, CALL_OPENS_BEFORE_START_MIN } from './constants';
import { formatTime, formatTimeRange, type DisplayOptions } from './format';
import { dayNumber, getDeviceTimeZone, inZone, pad, toDate } from './parse';
import { InvalidDateTimeError, type InstantInput, type Locale } from './types';

const MINUTE_MS = 60_000;

/**
 * Timer of the call screen (D1.1-31, D1.5-08): `04:37`, then `1:04:37` from one hour.
 * Takes elapsed seconds, never below 0, fractions dropped.
 */
export function formatTimer(elapsedSeconds: number): string {
  if (!Number.isFinite(elapsedSeconds)) {
    throw new InvalidDateTimeError('Timer needs a finite number of seconds');
  }
  const total = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Remaining time of a countdown: `2 h 15 min`, `2 h`, `12 min`, `45 s`. Never rounds up. */
export function formatCountdown(remainingMs: number): string {
  if (!Number.isFinite(remainingMs)) {
    throw new InvalidDateTimeError('Countdown needs a finite number of milliseconds');
  }
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  }
  if (totalSeconds >= 60) return `${Math.floor(totalSeconds / 60)} min`;
  return `${totalSeconds} s`;
}

export type CallState = 'upcoming' | 'open' | 'ended';

export interface CallWindowInput {
  startAt: InstantInput;
  endAt: InstantInput;
  /** The current instant, already corrected with the server offset (D1.5-09). */
  now: InstantInput;
}

/** The call window: 5 min before the start until 10 min after the end (EF-22). */
export function getCallWindow(
  startAt: InstantInput,
  endAt: InstantInput,
): { opensAt: Date; closesAt: Date } {
  return {
    opensAt: new Date(toDate(startAt).getTime() - CALL_OPENS_BEFORE_START_MIN * MINUTE_MS),
    closesAt: new Date(toDate(endAt).getTime() + CALL_CLOSES_AFTER_END_MIN * MINUTE_MS),
  };
}

export function getCallState(input: CallWindowInput): CallState {
  const { opensAt, closesAt } = getCallWindow(input.startAt, input.endAt);
  const now = toDate(input.now).getTime();
  if (now < opensAt.getTime()) return 'upcoming';
  if (now > closesAt.getTime()) return 'ended';
  return 'open';
}

const CALL_TEXT = {
  fr: {
    availableOn: (date: string, time: string) => `Appel disponible le ${date} à ${time}`,
    availableIn: (remaining: string) => `Appel disponible dans ${remaining}`,
    active: 'Appel vocal',
    ended: 'Appel terminé',
  },
  en: {
    availableOn: (date: string, time: string) => `Call available on ${date} at ${time}`,
    availableIn: (remaining: string) => `Call available in ${remaining}`,
    active: 'Voice call',
    ended: 'Call ended',
  },
} as const satisfies Record<Locale, unknown>;

export interface CallLabel {
  state: CallState;
  label: string;
}

/**
 * Label of the call button (EF-19, D1.5-07):
 * - not the same day as now: `Call available on 5 March at 14:25`;
 * - the same day: `Call available in 2 h 15 min`, `in 12 min`, `in 45 s`;
 * - window open: `Voice call · 14:30 – 15:00`;
 * - after the window: `Call ended`.
 * Dates and times are in the display timezone.
 */
export function formatCallLabel(input: CallWindowInput, options: DisplayOptions): CallLabel {
  const zone = options.timeZone ?? getDeviceTimeZone();
  const state = getCallState(input);
  const text = CALL_TEXT[options.locale];
  if (state === 'ended') return { state, label: text.ended };
  if (state === 'open') {
    const range = formatTimeRange(input.startAt, input.endAt, options);
    return { state, label: `${text.active} · ${range}` };
  }
  const { opensAt } = getCallWindow(input.startAt, input.endAt);
  const opensDay = inZone(opensAt, zone).format('YYYY-MM-DD');
  const today = inZone(input.now, zone).format('YYYY-MM-DD');
  if (dayNumber(opensDay) === dayNumber(today)) {
    const remaining = opensAt.getTime() - toDate(input.now).getTime();
    return { state, label: text.availableIn(formatCountdown(remaining)) };
  }
  const sameYear = inZone(opensAt, zone).year() === inZone(input.now, zone).year();
  const date = inZone(opensAt, zone)
    .locale(options.locale)
    .format(sameYear ? 'D MMMM' : 'D MMMM YYYY');
  return { state, label: text.availableOn(date, formatTime(opensAt, options)) };
}
