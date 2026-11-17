import type { ErrorCode } from '@medikart/shared';

/**
 * English texts. This file defines the shape: `fr.ts` must have exactly the same keys
 * (type `Translation`), so a missing or extra key fails `yarn typecheck`.
 */
const errors = {
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You are not allowed to do this.',
  FORBIDDEN_FIELD: 'You are not allowed to change this information.',
  DOCTOR_ACCOUNT: 'A doctor account cannot be deleted from the app.',
  NOT_FOUND: 'This item no longer exists or is not available.',
  VALIDATION_ERROR: 'Some information is invalid. Please check the form.',
  QUERY_TOO_SHORT: 'Type a few more letters to search.',
  RANGE_TOO_LARGE: 'The selected period is too long.',
  SLOT_TAKEN: 'This time slot has just been taken. Please choose another one.',
  OUT_OF_WINDOW: 'This date is outside the booking period.',
  SLOT_NOT_IN_SCHEDULE: "This time is outside the doctor's schedule.",
  LIMIT_REACHED: 'You have reached the maximum number of upcoming appointments.',
  ONE_PER_DAY: 'You already have an appointment on this day.',
  DOCTOR_NOT_AVAILABLE: 'This doctor is not available for booking.',
  CANCEL_TOO_LATE: 'It is too late to cancel this appointment.',
  INVALID_TRANSITION: 'This change is not possible for this appointment.',
  NOT_COMPLETED: 'You can rate a doctor once the appointment is completed.',
  ALREADY_REVIEWED: 'You have already rated this appointment.',
  SCHEDULE_CONFLICT: 'This change affects existing appointments.',
  EXCEPTION_CONFLICT: 'This absence affects existing appointments.',
  SLOT_DURATION_LOCKED: 'The slot duration cannot be changed at the moment.',
  OVERLAPPING_RANGES: 'Time ranges must not overlap.',
  CROSSES_MIDNIGHT: 'A time range cannot go past midnight.',
  HAS_UPCOMING_APPOINTMENTS: 'This cannot be done while upcoming appointments exist.',
  EMAIL_EXISTS: 'An account already uses this email address.',
  ALREADY_ACTIVATED: 'This account is already activated.',
  FILE_TOO_LARGE: 'This file is too large.',
  UNSUPPORTED_FORMAT: 'This file format is not supported.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  APP_VERSION_UNSUPPORTED: 'Please update the app to continue.',
  INTERNAL_ERROR: 'Something went wrong on our side. Please try again later.',
  MALFORMED_REQUEST: 'The request could not be understood. Please try again.',
  METHOD_NOT_ALLOWED: 'This action is not available.',
} satisfies Record<ErrorCode, string>;

export const en = {
  common: {
    appName: 'Medikart',
    loading: 'Loading',
    retry: 'Try again',
    cancel: 'Cancel',
    ok: 'OK',
    search: 'Search',
  },
  // Used when the error code is unknown to the app (newer server) or the network fails.
  errorsFallback: {
    unknown: 'Something went wrong. Please try again.',
    network: 'No connection. Check your network and try again.',
  },
  errors,
  gallery: {
    title: 'Component gallery',
    subtitle: 'Development only: theme and base components.',
    sectionColors: 'Colors',
    sectionTypography: 'Type scale',
    sectionButtons: 'Buttons',
    sectionInputs: 'Text input',
    sectionCards: 'Card and avatar',
    sectionChips: 'Chips',
    sectionLoader: 'Loader',
    sectionShared: 'Shared package',
    sectionLanguage: 'Language',
    sampleDisplay: 'Display',
    sampleTitle: 'Title',
    sampleHeading: 'Heading',
    sampleBody: 'Body text follows the phone font size.',
    sampleCaption: 'Caption',
    buttonPrimary: 'Primary',
    buttonSecondary: 'Secondary',
    buttonDanger: 'Danger',
    buttonDisabled: 'Disabled',
    buttonLoading: 'Loading',
    inputLabel: 'Full name',
    inputPlaceholder: 'Type here',
    inputError: 'This field is required.',
    cardTitle: 'Card title',
    cardText: 'Cards group related content on a white surface.',
    avatarLabel: 'Initials avatar',
    chipAll: 'All',
    chipOne: 'First',
    chipTwo: 'Second',
    loaderLabel: 'Loading content',
    timeLabel: 'Time computed by @medikart/shared (Lubumbashi)',
    errorLabel: 'Error code translated',
    languageLabel: 'Current language',
  },
};

/** Every leaf of the English file becomes `string`: the shape the other languages must follow. */
type Strings<T> = { [K in keyof T]: T[K] extends string ? string : Strings<T[K]> };
export type Translation = Strings<typeof en>;
