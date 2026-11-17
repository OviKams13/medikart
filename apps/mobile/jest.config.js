// Packages published as ES modules for React Native (the "react-native" export condition) must
// be transformed by Babel: the preset only does it for react-native and @react-native packages.
const transformedPackages = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  '@react-navigation',
  '@reduxjs/toolkit',
  '@tanstack',
  'react-redux',
  'redux',
  'redux-thunk',
  'immer',
  'reselect',
];

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [`node_modules/(?!(${transformedPackages.join('|')})/)`],
};
