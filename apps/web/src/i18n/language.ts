import type { Locale } from '@medikart/shared';

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const satisfies readonly Locale[];
/** Report §8: French by default (also used when the browser speaks neither French nor English). */
export const FALLBACK_LANGUAGE: Locale = 'fr';

export function isSupported(language: string): language is Locale {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
}

/** First browser language (in the browser's priority order) that the dashboard supports. */
export function detectBrowserLanguage(
  languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages,
): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0] ?? '';
    if (isSupported(base)) return base;
  }
  return FALLBACK_LANGUAGE;
}
