import { colors, formatTime } from '@medikart/shared';
import { useApiErrorMessage, useAppConfig } from '../api';
import { useAuth, useAuthControls } from '../auth';
import { Button } from '../components/Button';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useErrorMessage, useLocale, useTranslation } from '../i18n';

// A fixed instant: 12:30 UTC is 14:30 in Lubumbashi (UTC+2), whatever the computer's timezone.
const SAMPLE_INSTANT = '2026-10-02T12:30:00Z';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-divider bg-surface p-4">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Development page (4.27), like the mobile gallery: simulated session, the shared datetime
 * module, a translated API error, the palette and an `/app-config` call. Registered in
 * development builds only.
 */
export function DevPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const auth = useAuth();
  const { setAuth } = useAuthControls();
  const config = useAppConfig();
  const apiErrorMessage = useApiErrorMessage();
  const errorMessage = useErrorMessage();

  const state = auth.status === 'signedIn' ? auth.role : auth.status;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text">{t('dev.title')}</h1>
        <p className="text-text-secondary">{t('dev.subtitle')}</p>
        <LanguageSwitch />
      </header>

      <Section title={t('dev.sectionSession')}>
        <p className="text-text-secondary">
          {t('dev.current')}: <span data-testid="auth-state">{state}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setAuth({ status: 'signedOut' })}>
            {t('dev.signedOut')}
          </Button>
          <Button onClick={() => setAuth({ status: 'signedIn', role: 'DOCTOR' })}>
            {t('dev.doctor')}
          </Button>
          <Button onClick={() => setAuth({ status: 'signedIn', role: 'ADMIN' })}>
            {t('dev.admin')}
          </Button>
        </div>
      </Section>

      <Section title={t('dev.sectionShared')}>
        <p>
          {t('dev.timeLabel')}:{' '}
          <strong data-testid="shared-time">
            {formatTime(SAMPLE_INSTANT, { locale, timeZone: 'Africa/Lubumbashi' })}
          </strong>
        </p>
        <p>
          {t('dev.errorLabel')}: <strong>{errorMessage('SLOT_TAKEN')}</strong>
        </p>
      </Section>

      <Section title={t('dev.sectionApi')}>
        <p className="text-text-secondary">{t('dev.apiConfigLabel')}</p>
        {config.status === 'loading' && <p>{t('common.loading')}</p>}
        {config.status === 'success' && (
          <p>
            {t('dev.apiMinimumVersion')}:{' '}
            <strong data-testid="minimum-version">
              {config.data.minimumVersion ?? t('common.notSet')}
            </strong>
          </p>
        )}
        {config.status === 'error' && (
          <p role="alert" className="text-danger">
            {apiErrorMessage(config.error)}
          </p>
        )}
        <div>
          <Button variant="secondary" onClick={config.reload}>
            {t('dev.apiRefresh')}
          </Button>
        </div>
      </Section>

      <Section title={t('dev.sectionColors')}>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(colors)
            .filter(([name]) => name !== 'transparent')
            .map(([name, value]) => (
              <li key={name} className="flex items-center gap-2 text-sm text-text-secondary">
                <span
                  aria-hidden="true"
                  className="size-6 shrink-0 rounded border border-divider"
                  ref={(element) => {
                    // The swatch shows the value of the palette itself: it is data, not a style choice.
                    element?.style.setProperty('background-color', value);
                  }}
                />
                {name}
              </li>
            ))}
        </ul>
      </Section>
    </main>
  );
}
