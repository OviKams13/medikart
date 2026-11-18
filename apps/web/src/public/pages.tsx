import { Link } from 'react-router';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useTranslation } from '../i18n';

function PublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-primary">Medikart</p>
        <LanguageSwitch />
      </div>
      {children}
    </main>
  );
}

/** Login of doctors and administrators (email and password, Firebase): point 5. */
export function LoginPage() {
  const { t } = useTranslation();
  return (
    <PublicFrame>
      <PlaceholderPage title={t('pages.login')}>
        <Link to="/forgot-password" className="text-primary underline">
          {t('pages.forgotPassword')}
        </Link>
        {import.meta.env.DEV && (
          <Link to="/dev" className="text-text-secondary underline">
            {t('nav.dev')}
          </Link>
        )}
      </PlaceholderPage>
    </PublicFrame>
  );
}

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <PublicFrame>
      <PlaceholderPage title={t('pages.forgotPassword')} />
    </PublicFrame>
  );
}

/** Public account-deletion page required by Google Play (EF-25): built with the deletion feature. */
export function DeleteAccountPage() {
  const { t } = useTranslation();
  return (
    <PublicFrame>
      <PlaceholderPage title={t('pages.deleteAccount')} />
    </PublicFrame>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <PublicFrame>
      <PlaceholderPage title={t('pages.notFound')} />
    </PublicFrame>
  );
}
