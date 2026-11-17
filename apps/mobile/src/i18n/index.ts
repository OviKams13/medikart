import type { ErrorCode, Locale } from '@medikart/shared';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { en } from './en';
import { fr } from './fr';
import { detectPhoneLanguage, FALLBACK_LANGUAGE, isSupported } from './language';

/**
 * Translation setup (4.20). French and English; default = the phone's language, French when the
 * phone speaks neither. Call `initI18n()` once before the first render.
 */
export function initI18n(language: Locale = detectPhoneLanguage()) {
  if (!i18next.isInitialized) {
    i18next.use(initReactI18next).init({
      resources: { en: { translation: en }, fr: { translation: fr } },
      lng: language,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: ['fr', 'en'],
      // React Native does not render HTML: no escaping needed.
      interpolation: { escapeValue: false },
      // Resources are bundled: ready synchronously, no flash of raw keys.
      initAsync: false,
    });
  }
  return i18next;
}

export async function changeLanguage(language: Locale) {
  await i18next.changeLanguage(language);
}

/**
 * The current language as a `Locale`: the value every datetime function of @medikart/shared
 * takes. Re-renders when the language changes.
 */
export function useLocale(): Locale {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;
  return isSupported(current) ? current : FALLBACK_LANGUAGE;
}

/** The translated message of an API error code. The server `message` is never shown (report §10). */
export function useErrorMessage(): (code: ErrorCode | string | undefined) => string {
  const { t } = useTranslation();
  return (code) =>
    code !== undefined && code in en.errors
      ? t(`errors.${code as ErrorCode}`)
      : t('errorsFallback.unknown');
}

export { useTranslation } from 'react-i18next';
export { i18next };
export type { Translation } from './en';
