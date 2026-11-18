import { PlaceholderPage } from '../components/PlaceholderPage';
import { useTranslation } from '../i18n';

/**
 * Administration (report §7.2, EF-27). 4.27: placeholders in the final navigation tree. Only the
 * ADMIN role reaches them (route guard here, server check on every request).
 */
export function DoctorsPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.doctors')} />;
}

export function NewDoctorPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.newDoctor')} />;
}

export function EditDoctorPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.editDoctor')} />;
}

export function ClinicsPage() {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('pages.clinics')} />;
}
