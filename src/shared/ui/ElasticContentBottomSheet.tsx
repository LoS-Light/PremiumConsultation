import BottomSheet, { type BottomSheetProps } from '@gorhom/bottom-sheet';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { createElasticContentGestures } from './elasticContentGestures';

type Props = Omit<BottomSheetProps, 'enableOverDrag' | 'gestureEventsHandlersHook'>;

// A @gorhom/bottom-sheet BottomSheet whose sheet never stretches past its snap points, but whose
// content does: pulling down at the lowest snap point stretches the content with an iOS-style
// rubber band and springs it back, like a scroll view's bounce. Every other drag (moving between
// snap points, scrolling a list once the sheet is at the top) keeps the library's behaviour.
// Takes the same props as BottomSheet, except over-drag and the gesture hook, which it owns.
export function ElasticContentBottomSheet({ children, ...props }: Props) {
  const contentStretch = useSharedValue(0);
  const gestureEventsHandlersHook = useMemo(
    () => createElasticContentGestures(contentStretch),
    [contentStretch],
  );
  const stretchStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentStretch.value }],
  }));

  return (
    <BottomSheet
      {...props}
      enableOverDrag={false}
      gestureEventsHandlersHook={gestureEventsHandlersHook}
    >
      <Animated.View style={[styles.content, stretchStyle]}>{children}</Animated.View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
