import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholders of the navigation tree (4.21): a translated title only, replaced by the real screens.

export function BookingStep1Screen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.booking1')} />;
}

export function BookingStep2Screen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.booking2')} />;
}
