import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SessionStatus } from '../store';

/**
 * Typed routes (4.21). Navigation tree of report §7.1:
 *   Root: Splash | Auth | App (chosen by the session state only) | DevGallery (development builds)
 *   Auth: Onboarding -> Login -> OTP -> Profile completion
 *   App:  Tabs (Home, Appointments, Settings, Profile) + Search, Doctors, Doctor profile,
 *         Booking 1, Booking 2, Appointment detail, Voice call, Notifications
 * Identifiers are strings (ObjectId, report §10.1).
 */
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OtpVerification: undefined;
  ProfileCompletion: undefined;
};

export type TabParamList = {
  Home: undefined;
  Appointments: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Search: undefined;
  Doctors: { symptomId?: string } | undefined;
  DoctorProfile: { doctorId: string };
  BookingStep1: { doctorId: string };
  BookingStep2: { doctorId: string };
  AppointmentDetail: { appointmentId: string };
  VoiceCall: { appointmentId: string };
  Notifications: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  App: NavigatorScreenParams<AppStackParamList> | undefined;
  DevGallery: undefined;
};

export type { SessionStatus };

declare global {
  namespace ReactNavigation {
    // Makes `useNavigation()`, `navigate()` and `Link` check route names and params everywhere.
    interface RootParamList extends RootStackParamList {}
  }
}
