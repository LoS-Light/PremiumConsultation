import { useCallback } from 'react';
import { type PressableStateCallbackType, StyleSheet, Text } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../theme';
import { ThrottledPressable } from './ThrottledPressable';

// Figma "primary button": black, 56 pt tall, radius 12, white Inter SemiBold 16 label, full
// width. The small size (not in Figma) is as wide as its label and 40 pt tall, for an action
// that shouldn't dominate, like Retry in the list.
export function PrimaryButton({
  label,
  onPress,
  size = 'regular',
}: {
  label: string;
  onPress: () => void;
  size?: 'regular' | 'small';
}) {
  const isSmall = size === 'small';
  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.button,
      isSmall && styles.smallButton,
      pressed && styles.pressed,
    ],
    [isSmall],
  );

  return (
    <ThrottledPressable accessibilityRole="button" onPress={onPress} style={pressableStyle}>
      <Text style={[styles.label, isSmall && styles.smallLabel]}>{label}</Text>
    </ThrottledPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
    borderRadius: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.actionBackground,
  },
  // Not in Figma: 40 pt (the iOS small control height), with the full button's look scaled down.
  smallButton: {
    height: 40,
    width: 'auto',
    borderRadius: 10,
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textOnPrimary,
    textAlign: 'center',
  },
  smallLabel: {
    ...TYPOGRAPHY.subtitle1,
  },
});
