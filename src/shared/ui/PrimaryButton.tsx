import { StyleSheet, Text } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../theme';
import { ThrottledPressable } from './ThrottledPressable';

// Figma "primary button": black, 56 pt tall, radius 12, white Inter SemiBold 16 label.
export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <ThrottledPressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
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
  pressed: {
    opacity: 0.8,
  },
  label: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textOnPrimary,
    textAlign: 'center',
  },
});
