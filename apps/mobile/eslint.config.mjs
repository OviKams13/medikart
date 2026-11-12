import js from '@eslint/js';
import reactNative from '@react-native/eslint-config/flat';
import { datetimeRestrictions } from '@medikart/shared/eslint';

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

export default [
  { ignores: ['node_modules/**', 'android/**', 'coverage/**'] },
  js.configs.recommended,
  ...reactNative.map(withoutFlow),
  // D1.5-01: no date formatting outside the datetime module of @medikart/shared (4.14).
  ...datetimeRestrictions(),
];
