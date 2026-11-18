import { errorMessagesEn } from '@medikart/shared';

/**
 * English texts of the dashboard. This file defines the shape: `fr.ts` must have exactly the same
 * keys (type `Translation`), so a missing or extra key fails `yarn typecheck`.
 * The 33 API error messages are shared with the mobile app (`@medikart/shared`).
 */
export const en = {
  common: {
    appName: 'Medikart',
    loading: 'Loading',
    retry: 'Try again',
    notSet: 'not set',
    comingSoon: 'This page will be built in a later step of the plan.',
  },
  // Used when the error code is unknown to the dashboard (newer server) or the network fails.
  errorsFallback: {
    unknown: 'Something went wrong. Please try again.',
    network: 'No connection. Check your network and try again.',
  },
  errors: errorMessagesEn,
  language: {
    label: 'Language',
    fr: 'Français',
    en: 'English',
  },
  nav: {
    main: 'Main menu',
    doctorArea: 'Doctor area',
    administration: 'Administration',
    agenda: 'Agenda',
    schedules: 'Schedules',
    leave: 'Leave',
    profile: 'My profile',
    doctors: 'Doctors',
    clinics: 'Clinics',
    dev: 'Dev page',
    signOut: 'Sign out',
  },
  pages: {
    login: 'Sign in',
    forgotPassword: 'Forgot your password',
    agenda: 'Agenda',
    appointmentDetail: 'Appointment details',
    schedules: 'Weekly schedules',
    leave: 'Leave',
    profile: 'My profile',
    incomingCall: 'Incoming call',
    callScreen: 'Call',
    doctors: 'Doctors',
    newDoctor: 'New doctor',
    editDoctor: 'Edit a doctor',
    clinics: 'Clinics',
    deleteAccount: 'Delete my account',
    notFound: 'Page not found',
  },
  dev: {
    title: 'Dev page',
    subtitle: 'Development only: shared package, API call and simulated session.',
    sectionSession: 'Simulated session',
    signedOut: 'Signed out',
    doctor: 'Doctor',
    admin: 'Administrator',
    current: 'Current state',
    sectionShared: 'Shared package',
    timeLabel: 'Time computed by @medikart/shared (Lubumbashi)',
    errorLabel: 'Error code translated',
    sectionApi: 'API',
    apiConfigLabel: 'GET /app-config',
    apiMinimumVersion: 'Minimum version',
    apiRefresh: 'Call again',
    sectionColors: 'Palette (@medikart/shared)',
  },
};

/** Every leaf of the English file becomes `string`: the shape the other languages must follow. */
type Strings<T> = { [K in keyof T]: T[K] extends string ? string : Strings<T[K]> };
export type Translation = Strings<typeof en>;
