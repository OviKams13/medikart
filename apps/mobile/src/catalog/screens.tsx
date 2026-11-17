import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholders of the navigation tree (4.21): a translated title only, replaced by the real screens.

export function HomeScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.home')} />;
}

export function SearchScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.search')} />;
}

export function DoctorsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.doctors')} />;
}

export function DoctorProfileScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.doctorProfile')} />;
}
