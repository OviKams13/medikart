import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholders of the navigation tree (4.21): a translated title only, replaced by the real screens.

export function SettingsScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.settings')} />;
}

export function ProfileScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.profile')} />;
}
