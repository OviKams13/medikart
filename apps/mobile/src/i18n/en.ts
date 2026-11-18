import { errorMessagesEn } from '@medikart/shared';

/**
 * English texts. This file defines the shape: `fr.ts` must have exactly the same keys
 * (type `Translation`), so a missing or extra key fails `yarn typecheck`.
 */
const errors = errorMessagesEn;

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
  screens: {
    splash: 'Starting',
    onboarding: 'Welcome',
    login: 'Sign in',
    otp: 'Verification',
    profileCompletion: 'Your profile',
    home: 'Home',
    appointments: 'Appointments',
    settings: 'Settings',
    profile: 'Profile',
    search: 'Search',
    doctors: 'Doctors',
    doctorProfile: 'Doctor profile',
    booking1: 'Booking',
    booking2: 'Choose a time slot',
    appointmentDetail: 'Appointment details',
    voiceCall: 'Voice call',
    notifications: 'Notifications',
    update: 'Update required',
  },
  update: {
    title: 'Please update Medikart',
    message:
      'This version of the app is no longer supported. Update it to keep booking appointments.',
    messageNoLink:
      'This version of the app is no longer supported. The update is not available yet: please try again later.',
    store: 'Update the app',
    checkAgain: 'Check again',
    installed: 'Installed version',
    required: 'Required version',
    support: 'Need help? Write to {{email}}',
  },
  dev: {
    menu: 'Dev',
    gallery: 'Component gallery',
    session: 'Simulated session',
    restoring: 'Restoring',
    signedOut: 'Signed out',
    signedIn: 'Signed in',
  },
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
    sectionApi: 'API and server clock',
    apiConfigLabel: 'GET /app-config',
    apiMinimumVersion: 'Minimum version',
    apiClockOffset: 'Clock offset',
    apiClockUnmeasured: 'not measured yet',
    apiNow: 'Corrected time',
    apiRefresh: 'Call again',
    notSet: 'not set',
  },
};

/** Every leaf of the English file becomes `string`: the shape the other languages must follow. */
type Strings<T> = { [K in keyof T]: T[K] extends string ? string : Strings<T[K]> };
export type Translation = Strings<typeof en>;
