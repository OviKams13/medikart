import { PlaceholderScreen } from '../components';
import { useTranslation } from '../i18n';

// Placeholders of the navigation tree (4.21): a translated title only, replaced by the real screens.

export function OnboardingScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.onboarding')} />;
}

export function LoginScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.login')} />;
}

export function OtpVerificationScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.otp')} />;
}

export function ProfileCompletionScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.profileCompletion')} />;
}
