import { useEffect, useState } from 'react';
import { Animated, Text } from 'react-native';

import { makeStyles, TYPOGRAPHY } from '../../../shared/theme';

const FADE_MS = 200;
const VISIBLE_MS = 2000;

// One toast: fades in, stays 2 s, fades out, then asks to be removed. The same on both
// platforms (no native Toast, which is Android-only). onDone must be stable (it gets the
// toast's key), so the animation runs once from the toast's own press and isn't restarted
// when other toasts come and go.
export function ToastMessage({
  toastKey,
  text,
  onDone,
}: {
  toastKey: number;
  text: string;
  onDone: (toastKey: number) => void;
}) {
  const styles = useStyles();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }),
      Animated.delay(VISIBLE_MS),
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        onDone(toastKey);
      }
    });
    return () => animation.stop();
  }, [opacity, onDone, toastKey]);

  return (
    <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  toast: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.toastBackground,
  },
  text: {
    ...TYPOGRAPHY.subtitle3,
    color: colors.toastText,
  },
}));
