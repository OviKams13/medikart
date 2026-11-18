import type { RouteObject } from 'react-router';
import { ClinicsPage, DoctorsPage, EditDoctorPage, NewDoctorPage } from '../admin/pages';
import { HomeRedirect, RequireRole } from '../auth';
import { DashboardLayout } from '../components/DashboardLayout';
import { DevPage } from '../dev/DevPage';
import {
  AgendaPage,
  AppointmentDetailPage,
  CallScreenPage,
  DoctorProfilePage,
  IncomingCallPage,
  LeavePage,
  SchedulesPage,
} from '../doctor/pages';
import { DeleteAccountPage, ForgotPasswordPage, LoginPage, NotFoundPage } from '../public/pages';

/**
 * Navigation tree of the dashboard (report §7.2):
 *   public:  /login, /forgot-password, /supprimer-mon-compte
 *   doctor:  /agenda, /agenda/appointments/:id, /schedules, /leave, /profile, /incoming-call,
 *            /call/:appointmentId                                   (role DOCTOR)
 *   admin:   /admin/doctors, /admin/doctors/new, /admin/doctors/:id, /admin/clinics (role ADMIN)
 *   dev:     /dev (development builds only)
 * Which area a user can open depends only on the auth state (see `auth`).
 */
export function createRoutes({
  showDevPage = import.meta.env.DEV,
}: { showDevPage?: boolean } = {}): RouteObject[] {
  return [
    { path: '/', element: <HomeRedirect /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    // Public page required by Google Play (EF-25): this exact French path.
    { path: '/supprimer-mon-compte', element: <DeleteAccountPage /> },
    {
      element: <RequireRole role="DOCTOR" />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            { path: '/agenda', element: <AgendaPage /> },
            { path: '/agenda/appointments/:appointmentId', element: <AppointmentDetailPage /> },
            { path: '/schedules', element: <SchedulesPage /> },
            { path: '/leave', element: <LeavePage /> },
            { path: '/profile', element: <DoctorProfilePage /> },
            { path: '/incoming-call', element: <IncomingCallPage /> },
            { path: '/call/:appointmentId', element: <CallScreenPage /> },
          ],
        },
      ],
    },
    {
      element: <RequireRole role="ADMIN" />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            { path: '/admin/doctors', element: <DoctorsPage /> },
            { path: '/admin/doctors/new', element: <NewDoctorPage /> },
            { path: '/admin/doctors/:doctorId', element: <EditDoctorPage /> },
            { path: '/admin/clinics', element: <ClinicsPage /> },
          ],
        },
      ],
    },
    ...(showDevPage ? [{ path: '/dev', element: <DevPage /> }] : []),
    { path: '*', element: <NotFoundPage /> },
  ];
}
