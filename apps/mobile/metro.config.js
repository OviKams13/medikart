const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Monorepo (4.16): @medikart/shared is a Yarn workspace whose TypeScript source is consumed
// directly. Yarn links it into the root node_modules, so Metro must also watch its real folder.
const workspaceRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  // Yarn hoists node_modules (react-native, babel runtime...) and links @medikart/shared at the
  // repository root: Metro must watch the whole workspace, not only apps/mobile.
  watchFolders: [workspaceRoot],
};

module.exports = mergeConfig(defaultConfig, config);
