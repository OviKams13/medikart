import type { Locale } from '@medikart/shared';
import { findBestLanguageTag } from 'react-native-localize';

export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const satisfies readonly Locale[];
/** Report §8: French by default (also used when the phone speaks neither French nor English). */
export const FALLBACK_LANGUAGE: Locale = 'fr';

export function isSupported(language: string): language is Locale {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
}

/** Picks the first phone language (in the phone's priority order) that the app supports. */
export function detectPhoneLanguage(): Locale {
  const best = findBestLanguageTag([...SUPPORTED_LANGUAGES]);
  return best && isSupported(best.languageTag) ? best.languageTag : FALLBACK_LANGUAGE;
}
