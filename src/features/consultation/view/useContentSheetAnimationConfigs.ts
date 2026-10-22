import { type ParamListBase, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import type { WithTimingConfig } from 'react-native-reanimated';

import { useSheetAnimationConfigs } from '../../../shared/ui/useSheetAnimationConfigs';

// After this long, the content sheet springs even if no push transition ended (the app opened on
// this screen, say).
const SPRING_FALLBACK_MS = 1000;

// Passed as is: the library's useBottomSheetTimingConfigs treats a 0 duration as unset and uses
// its 250 ms default.
const INSTANT_CONFIGS: WithTimingConfig = { duration: 0 };

// The content sheet's animation: instant while the screen is entering, then the shared spring.
// With animateOnMount off, @gorhom/bottom-sheet still snaps to the initial index on mount, and
// when the sheet's layout is ready early (from the second visit on) that snap is animated, so the
// sheet slid up from the bottom. An instant config makes that snap land at once; user drags then
// spring as usual.
export function useContentSheetAnimationConfigs() {
  // A stack screen, so it gets the stack's transitionEnd event.
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const springConfigs = useSheetAnimationConfigs();
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const markEntered = () => setHasEntered(true);
    const unsubscribe = navigation.addListener('transitionEnd', markEntered);
    const fallback = setTimeout(markEntered, SPRING_FALLBACK_MS);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigation]);

  return hasEntered ? springConfigs : INSTANT_CONFIGS;
}
