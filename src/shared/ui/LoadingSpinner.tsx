import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { COLORS } from '../theme';

// iOS's activity indicator: 12 spokes, 20 pt, the bright spoke going round once a second.
const SIZE = 20;
const SPOKE_COUNT = 12;
const SPOKE_WIDTH = 2;
const SPOKE_LENGTH = 5.5;
const TURN_MS = 1000;
// The faintest spoke, at the end of the trail.
const MIN_SPOKE_OPACITY = 0.25;

// Moves in 12 steps, a spoke at a time, as iOS's does, rather than smoothly.
const stepEasing = (progress: number) => Math.floor(progress * SPOKE_COUNT) / SPOKE_COUNT;

// The spokes' opacities, from the bright one back: the trail fades behind it.
const TRAIL_OPACITIES = Array.from(
  { length: SPOKE_COUNT },
  (_, distance) => 1 - (distance / SPOKE_COUNT) * (1 - MIN_SPOKE_OPACITY),
);
const STEP_INPUTS = Array.from({ length: SPOKE_COUNT + 1 }, (_, step) => step / SPOKE_COUNT);

// How many spokes `spoke` trails the bright one by, when the bright one is spoke `step` (counting
// round: a spoke ahead of it trails it by nearly a full turn).
function trailDistance(step: number, spoke: number): number {
  return (step - spoke + SPOKE_COUNT) % SPOKE_COUNT;
}

// A loading spinner that looks like iOS's on both platforms (ActivityIndicator is Material on
// Android). Like iOS's, the spokes stay still and only their opacities move round, so nothing
// rotates: a rotating view wobbled on Android as the spokes snapped to pixels.
export function LoadingSpinner({
  accessibilityLabel,
  testID,
}: {
  accessibilityLabel: string;
  testID?: string;
}) {
  const [turn] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(turn, {
        toValue: 1,
        duration: TURN_MS,
        easing: stepEasing,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [turn]);

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={styles.box}
    >
      {Array.from({ length: SPOKE_COUNT }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.spoke,
            {
              opacity: turn.interpolate({
                inputRange: STEP_INPUTS,
                outputRange: STEP_INPUTS.map(
                  (_input, step) => TRAIL_OPACITIES[trailDistance(step, index)],
                ),
              }),
              transform: [
                { rotate: `${index * (360 / SPOKE_COUNT)}deg` },
                { translateY: -(SIZE / 2 - SPOKE_LENGTH / 2) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spoke: {
    position: 'absolute',
    width: SPOKE_WIDTH,
    height: SPOKE_LENGTH,
    borderRadius: SPOKE_WIDTH / 2,
    backgroundColor: COLORS.spinner,
  },
});
