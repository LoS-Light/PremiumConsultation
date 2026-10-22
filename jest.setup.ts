// Native safe-area values are unavailable under Jest; use the library's mock.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
