import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { datetimeModuleExemption, datetimeRestrictions } from './eslint/index.mjs';

export default tseslint.config(
  { ignores: ['src/api/generated/**', 'node_modules/**', 'coverage/**', 'dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
  },
  // D1.5-01: no date formatting outside the datetime module (4.14).
  ...datetimeRestrictions(),
  datetimeModuleExemption,
);
