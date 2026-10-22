import 'react-native-gesture-handler/jestSetup';

// Native modules are unavailable under Jest; use each library's own mock.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
// Reanimated 4's own Jest mock still starts its CSS runtime, which fails under Jest. The app
// and Gesture Handler only use these APIs here (the bottom sheet itself is mocked below), so
// stub just them.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component: unknown) => component },
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: () => ({}),
    withSpring: (value: unknown) => value,
  };
});
// The bottom-sheet mock exports `default` without __esModule, so mark it for Babel's interop.
// It also lacks BottomSheetFooter, which renders its children as-is here.
jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  ...jest.requireActual('@gorhom/bottom-sheet/mock'),
  BottomSheetFooter: ({ children }: { children: unknown }) => children,
}));
