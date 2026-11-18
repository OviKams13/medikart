import js from '@eslint/js';
import { datetimeRestrictedSyntax, datetimeRestrictions } from '@medikart/shared/eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// 4.26: colors, fonts and sizes come from the theme (the palette of @medikart/shared, exposed as
// Tailwind classes such as `bg-primary`). The same idea as the mobile "theme values only" rule:
// no literal color, no inline style, no arbitrary Tailwind value, no class outside the palette.
const THEME_MESSAGE =
  'Use a theme class (palette and scale of @medikart/shared, see src/index.css), never a literal value (4.26).';
const DEFAULT_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const UTILITIES = 'bg|text|border|ring|outline|fill|stroke|from|to|via|divide|shadow|accent|caret';
const themeRestrictedSyntax = [
  {
    selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
    message: `Hard-coded color. ${THEME_MESSAGE}`,
  },
  {
    selector: String.raw`Literal[value=/^(rgb|rgba|hsl|hsla)\(/]`,
    message: `Hard-coded color. ${THEME_MESSAGE}`,
  },
  {
    selector: 'JSXAttribute[name.name="style"]',
    message: `Inline style. ${THEME_MESSAGE}`,
  },
  {
    // Tailwind arbitrary values with a color or a length: bg-[#fff], p-[13px], w-[2rem].
    selector: String.raw`Literal[value=/\[[^\]]*(#[0-9a-fA-F]{3,8}|\d(px|rem|em))[^\]]*\]/]`,
    message: `Arbitrary Tailwind value. ${THEME_MESSAGE}`,
  },
  {
    selector: String.raw`TemplateElement[value.raw=/\[[^\]]*(#[0-9a-fA-F]{3,8}|\d(px|rem|em))[^\]]*\]/]`,
    message: `Arbitrary Tailwind value. ${THEME_MESSAGE}`,
  },
  {
    // Tailwind's default colors are removed from the theme: they would compile to nothing.
    selector: String.raw`Literal[value=/(^|\s)(${UTILITIES})-(${DEFAULT_PALETTE})(-\d+)?(\/\d+)?(\s|$)/]`,
    message: `Color outside the Medikart palette. ${THEME_MESSAGE}`,
  },
];

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['vite.config.ts', 'eslint.config.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  // D1.5-01: no date formatting outside the datetime module of @medikart/shared (4.14).
  ...datetimeRestrictions(),
  {
    // `no-restricted-syntax` is a single rule: the datetime selectors are repeated here.
    name: 'medikart/theme-only-values',
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...datetimeRestrictedSyntax, ...themeRestrictedSyntax],
    },
  },
);
