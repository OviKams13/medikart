import type { ErrorCode } from '@medikart/shared';
import { findBestLanguageTag } from 'react-native-localize';
import { en } from './en';
import { fr } from './fr';
import { changeLanguage, i18next, initI18n } from './index';
import { detectPhoneLanguage } from './language';

const mockedBestTag = findBestLanguageTag as jest.Mock;

// Compile-time proof (checked by `yarn typecheck`): one translation per ErrorCode, in both
// languages. If the shared package gains a code, these assignments fail until it is translated.
test('every ErrorCode of the shared package has a message in both languages', () => {
  const frErrors: Record<ErrorCode, string> = fr.errors;
  const enErrors: Record<ErrorCode, string> = en.errors;
  expect(Object.keys(frErrors)).toEqual(expect.arrayContaining(Object.keys(enErrors)));
});

function leafKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'string' ? [`${prefix}${key}`] : leafKeys(child as object, `${prefix}${key}.`),
  );
}

describe('translations', () => {
  test('French and English have exactly the same keys', () => {
    expect(leafKeys(fr).sort()).toEqual(leafKeys(en).sort());
  });

  test('no translation is empty', () => {
    for (const language of [fr, en]) {
      for (const key of leafKeys(language)) {
        const text = key
          .split('.')
          .reduce<unknown>((node, part) => (node as never)[part], language);
        expect((text as string).trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('the 33 error codes of the API are all translated', () => {
    expect(Object.keys(en.errors)).toHaveLength(33);
    expect(Object.keys(fr.errors).sort()).toEqual(Object.keys(en.errors).sort());
  });

  test('French and English texts differ for the error messages', () => {
    for (const code of Object.keys(en.errors) as ErrorCode[]) {
      expect(fr.errors[code]).not.toBe(en.errors[code]);
    }
  });
});

describe('language detection', () => {
  test('uses French when the phone is in French', () => {
    mockedBestTag.mockReturnValue({ languageTag: 'fr', isRTL: false });
    expect(detectPhoneLanguage()).toBe('fr');
  });

  test('uses English when the phone is in English', () => {
    mockedBestTag.mockReturnValue({ languageTag: 'en', isRTL: false });
    expect(detectPhoneLanguage()).toBe('en');
  });

  test('falls back to French when the phone speaks neither', () => {
    mockedBestTag.mockReturnValue(undefined);
    expect(detectPhoneLanguage()).toBe('fr');
  });

  test('asks the phone with the supported languages only', () => {
    mockedBestTag.mockClear();
    detectPhoneLanguage();
    expect(mockedBestTag).toHaveBeenCalledWith(['fr', 'en']);
  });
});

describe('i18next instance', () => {
  test('starts in the language given, translates synchronously and switches language', async () => {
    initI18n('en');
    expect(i18next.t('errors.SLOT_TAKEN')).toBe(en.errors.SLOT_TAKEN);
    await changeLanguage('fr');
    expect(i18next.t('errors.SLOT_TAKEN')).toBe(fr.errors.SLOT_TAKEN);
    await changeLanguage('en');
    expect(i18next.language).toBe('en');
  });
});
