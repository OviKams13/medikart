import type { en } from './en';

// Typed keys: `t('nav.agenda')` is checked, a wrong key fails `yarn typecheck`.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
