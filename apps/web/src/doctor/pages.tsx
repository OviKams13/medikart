import { PlaceholderPage } from '../components/PlaceholderPage';
import { useTranslation } from '../i18n';

/**
 * Doctor area (report §7.2, EF-26). 4.27: placeholders in the final navigation tree. Each page
 * is replaced by the real one in its own point (agenda, schedules, leave, profile, calls).
 */
export function AgendaPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.agenda')} />;
}

export function AppointmentDetailPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.appointmentDetail')} />;
}

export function SchedulesPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.schedules')} />;
}

export function LeavePage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.leave')} />;
}

export function DoctorProfilePage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.profile')} />;
}

/** Becomes a window (accept / reject) over the current page when calls exist; a page for now. */
export function IncomingCallPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.incomingCall')} />;
}

export function CallScreenPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.callScreen')} />;
}
