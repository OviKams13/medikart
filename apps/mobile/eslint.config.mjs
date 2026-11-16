import js from '@eslint/js';
import reactNative from '@react-native/eslint-config/flat';
import { datetimeRestrictedSyntax, datetimeRestrictions } from '@medikart/shared/eslint';

// eslint-plugin-ft-flow (Flow type support, pulled by @react-native/eslint-config) crashes on
// ESLint 9 ("context.getAllComments is not a function"), and this project has no Flow code:
// its plugin and rules are removed from the React Native config.
const withoutFlow = (config) => {
  const { 'ft-flow': _plugin, ...plugins } = config.plugins ?? {};
  const rules = Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(([name]) => !name.startsWith('ft-flow/')),
  );
  return { ...config, plugins, rules };
};

// 4.18: the theme (src/theme) is the only place for colors, fonts, sizes and spacing.
// Outside it, style properties must read a theme value, never a literal.
const COLOR_PROPS =
  'color|backgroundColor|borderColor|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|tintColor|shadowColor|placeholderTextColor|textDecorationColor';
const SIZE_PROPS =
  'fontSize|lineHeight|letterSpacing|gap|rowGap|columnGap|width|height|minWidth|minHeight|maxWidth|maxHeight|borderWidth|elevation|' +
  '(padding|margin)(Top|Bottom|Left|Right|Start|End|Horizontal|Vertical)?|border(Top|Bottom|Start|End|Left|Right)*Radius';
const THEME_MESSAGE = 'Read this value from the theme (src/theme), never hard-code it (4.18).';
const themeRestrictedSyntax = [
  {
    selector: `Property[key.name=/^(${COLOR_PROPS})$/] > Literal`,
    message: `Hard-coded color. ${THEME_MESSAGE}`,
  },
  {
    selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
    message: `Hard-coded color. ${THEME_MESSAGE}`,
  },
  {
    selector: 'Literal[value=/^(rgb|rgba|hsl|hsla)\\(/]',
    message: `Hard-coded color. ${THEME_MESSAGE}`,
  },
  {
    selector: 'Property[key.name=/^(fontFamily|fontWeight)$/] > Literal',
    message: `Hard-coded font. ${THEME_MESSAGE}`,
  },
  {
    // Any number except 0 (raw starts with a digit 1-9); strings like '100%' are allowed.
    selector: `Property[key.name=/^(${SIZE_PROPS})$/] > Literal[raw=/^-?[1-9]/]`,
    message: `Hard-coded size or spacing. ${THEME_MESSAGE}`,
  },
];

export default [
  { ignores: ['node_modules/**', 'android/**', 'coverage/**'] },
  js.configs.recommended,
  ...reactNative.map(withoutFlow),
  // D1.5-01: no date formatting outside the datetime module of @medikart/shared (4.14).
  ...datetimeRestrictions(),
  {
    name: 'medikart/jest-setup',
    files: ['jest.setup.js'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
  {
    // `no-restricted-syntax` is a single rule: the datetime selectors are repeated here.
    name: 'medikart/theme-only-values',
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/theme/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...datetimeRestrictedSyntax, ...themeRestrictedSyntax],
    },
  },
];
