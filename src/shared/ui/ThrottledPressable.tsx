import { Pressable, type PressableProps } from 'react-native';

import { useThrottledPress } from './useThrottledPress';

// Layer 1 of the duplicate-press protection (SPEC §8a): a Pressable whose presses are
// throttled. Every pressable in the app uses it instead of Pressable or TouchableOpacity.
export function ThrottledPressable({ onPress, ...props }: PressableProps) {
  const throttledOnPress = useThrottledPress(onPress ?? undefined);
  return <Pressable {...props} onPress={throttledOnPress} />;
}
