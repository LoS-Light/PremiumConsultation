import { useCallback, useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { COLORS, SHADOWS } from '../theme';
import { ThrottledPressable } from './ThrottledPressable';

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const THUMB_INSET = 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;
const SLIDE_DURATION_MS = 200;
// Grows the touch area to at least 44 pt tall (Apple's minimum) around the 31 pt track.
const HIT_SLOP = { top: 7, bottom: 7, left: 7, right: 7 };

// An iOS-style switch on both platforms, so Android matches iOS (React Native's Switch is
// Material on Android). The thumb slides and the track turns green when on. Pressed through
// ThrottledPressable like every pressable (SPEC §8a).
export function ToggleSwitch({
  isOn,
  onChange,
  accessibilityLabel,
  accessibilityHint,
}: {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
  accessibilityLabel: string;
  // What switching does, read after the label (e.g. the row's description).
  accessibilityHint?: string;
}) {
  // Created once; kept in state rather than a ref so it can be read while rendering.
  const [position] = useState(() => new Animated.Value(isOn ? 1 : 0));

  useEffect(() => {
    Animated.timing(position, {
      toValue: isOn ? 1 : 0,
      duration: SLIDE_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [isOn, position]);

  const handlePress = useCallback(() => onChange(!isOn), [onChange, isOn]);

  return (
    <ThrottledPressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: isOn }}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: position.interpolate({
              inputRange: [0, 1],
              outputRange: [COLORS.switchOff, COLORS.switchOn],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [
                {
                  translateX: position.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, THUMB_TRAVEL],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </ThrottledPressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: THUMB_INSET,
  },
  thumb: {
    ...SHADOWS.switchThumb,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.surface,
  },
});
