import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholders of the navigation tree (4.21): a translated title only, replaced by the real screens.

export function AppointmentsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.appointments')} />;
}

export function AppointmentDetailScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.appointmentDetail')} />;
}
