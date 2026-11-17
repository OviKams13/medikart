import { usePreventRemove } from '@react-navigation/native';
import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholder of the navigation tree (4.21), replaced by the real call screen at point 12.
export function VoiceCallScreen() {
  const { t } = useTranslation();
  // Report §6: back navigation is blocked during the call (gesture, header and Android back
  // button). Leaving is done by the "end call" control of the real screen.
  usePreventRemove(true, () => undefined);
  return <PlaceholderScreen title={t('screens.voiceCall')} />;
}
