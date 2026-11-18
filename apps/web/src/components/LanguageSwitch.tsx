import { useEffect } from 'react';
import { changeLanguage, SUPPORTED_LANGUAGES, useLocale, useTranslation } from '../i18n';

/** Language choice (French or English) and the `lang` attribute of the page that follows it. */
export function LanguageSwitch() {
  const { t } = useTranslation();
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      {t('language.label')}
      <select
        value={locale}
        onChange={(event) => {
          const next = SUPPORTED_LANGUAGES.find((code) => code === event.target.value);
          if (next) void changeLanguage(next);
        }}
        className="min-h-11 rounded-lg border border-border-strong bg-surface px-2 text-text"
      >
        {SUPPORTED_LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
