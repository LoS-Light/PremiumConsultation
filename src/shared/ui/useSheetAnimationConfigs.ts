import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

// The bottom sheets' open and snap animation on both platforms. @gorhom/bottom-sheet springs on
// iOS but uses a 250 ms timing on Android, so the same sheet moved at a different pace; use
// the library's iOS spring everywhere so Android matches iOS.
export function useSheetAnimationConfigs() {
  return useBottomSheetSpringConfigs({
    damping: 500,
    stiffness: 1000,
    mass: 3,
    overshootClamping: true,
  });
}
