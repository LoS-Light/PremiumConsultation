import { useCallback, useRef } from 'react';

import { PRESS_THROTTLE_MS } from '../config/ui';
import { useFeatureFlag } from '../featureFlags/FeatureFlagProvider';

// Leading-edge throttle: the first press runs at once, and presses within PRESS_THROTTLE_MS
// of it are ignored. A ref (not state) so two presses in the same tick both see the first.
// The pressThrottle flag can switch it off for the demo (every press then runs).
export function useThrottledPress<Args extends unknown[]>(
  onPress: ((...args: Args) => void) | undefined,
): (...args: Args) => void {
  const isThrottleOn = useFeatureFlag('pressThrottle');
  const lastPressAt = useRef<number | null>(null);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (
        isThrottleOn &&
        lastPressAt.current !== null &&
        now - lastPressAt.current < PRESS_THROTTLE_MS
      ) {
        return;
      }
      lastPressAt.current = now;
      onPress?.(...args);
    },
    [isThrottleOn, onPress],
  );
}
