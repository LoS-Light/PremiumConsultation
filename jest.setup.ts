import 'react-native-gesture-handler/jestSetup';

// Native modules are unavailable under Jest; use each library's own mock.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
// Reanimated 4's own Jest mock still starts its CSS runtime, which fails under Jest. Only
// Gesture Handler touches Reanimated here (the bottom sheet itself is mocked below), through
// createAnimatedComponent, so stub just that.
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { createAnimatedComponent: (component: unknown) => component },
}));
// The bottom-sheet mock exports `default` without __esModule, so mark it for Babel's interop.
// Its BottomSheet drops `footerComponent`, so render the footer after the content as the real
// sheet does. It also lacks BottomSheetFooter, which renders its children as-is here.
jest.mock('@gorhom/bottom-sheet', () => {
  const { createElement, Fragment } = jest.requireActual<typeof import('react')>('react');
  function BottomSheet({
    children,
    footerComponent,
  }: {
    children: import('react').ReactNode;
    footerComponent?: import('react').FC<{ animatedFooterPosition: { value: number } }>;
  }) {
    return createElement(
      Fragment,
      null,
      children,
      footerComponent
        ? createElement(footerComponent, { animatedFooterPosition: { value: 0 } })
        : null,
    );
  }
  return {
    __esModule: true,
    ...jest.requireActual('@gorhom/bottom-sheet/mock'),
    default: BottomSheet,
    BottomSheetFooter: ({ children }: { children: unknown }) => children,
  };
});
