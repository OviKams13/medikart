import type { en } from './en';

// Typed keys (4.20): `t('typo')` or a missing key fails `yarn typecheck`.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
