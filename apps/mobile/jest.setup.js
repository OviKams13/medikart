// Native modules that do not exist in jest (4.19, 4.20).
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
// The phone language is chosen by each test through this mock.
jest.mock('react-native-localize', () => ({ findBestLanguageTag: jest.fn(() => undefined) }));
// The native splash (4.24): nothing to hide in jest.
jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: { hide: jest.fn(() => Promise.resolve()), isVisible: jest.fn(() => false) },
}));
