// Native modules that do not exist in jest (4.19, 4.20).
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
// The phone language is chosen by each test through this mock.
jest.mock('react-native-localize', () => ({ findBestLanguageTag: jest.fn(() => undefined) }));
