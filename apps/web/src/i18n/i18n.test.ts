import { errorMessagesEn, errorMessagesFr } from '@medikart/shared';
import { afterEach, describe, expect, test } from 'vitest';
import { changeLanguage, i18next, initI18n } from '.';
import { en } from './en';
import { fr } from './fr';
import { detectBrowserLanguage } from './language';

initI18n('fr');

afterEach(async () => {
  await changeLanguage('fr');
});

describe('language detection', () => {
  test('first supported browser language, in the browser order', () => {
    expect(detectBrowserLanguage(['sw', 'fr-CD', 'en'])).toBe('fr');
    expect(detectBrowserLanguage(['sw', 'en-GB', 'fr'])).toBe('en');
    expect(detectBrowserLanguage(['EN-us'])).toBe('en');
  });

  test('French when the browser speaks neither (report §8)', () => {
    expect(detectBrowserLanguage(['sw', 'ln'])).toBe('fr');
    expect(detectBrowserLanguage([])).toBe('fr');
  });
});

describe('translations', () => {
  const leaves = (value: unknown, prefix = ''): string[] =>
    typeof value === 'string'
      ? [prefix]
      : Object.entries(value as object).flatMap(([key, child]) =>
          leaves(child, prefix ? `${prefix}.${key}` : key),
        );

  test('French and English have exactly the same keys', () => {
    expect(leaves(fr).sort()).toEqual(leaves(en).sort());
  });

  test('no text is empty, and the 33 error codes are translated in both languages', () => {
    for (const text of [...leaves(en), ...leaves(fr)]) expect(text.length).toBeGreaterThan(0);
    expect(Object.keys(en.errors)).toHaveLength(33);
    expect(en.errors).toBe(errorMessagesEn);
    expect(fr.errors).toBe(errorMessagesFr);
    expect(Object.keys(fr.errors).sort()).toEqual(Object.keys(en.errors).sort());
  });

  test('the language can change at run time', async () => {
    expect(i18next.t('nav.agenda')).toBe(fr.nav.agenda);
    await changeLanguage('en');
    expect(i18next.t('nav.dev')).toBe(en.nav.dev);
  });
});
