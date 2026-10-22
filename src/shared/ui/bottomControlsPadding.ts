import { Platform } from 'react-native';

// Figma's 34 pt home-indicator area, and the 10 pt gap above it.
const MIN_BOTTOM_INSET = 34;
const GAP_ABOVE_BOTTOM_INSET = 10;
// The author's visual choice: on Android, controls sit a little higher above the gesture bar.
const ANDROID_EXTRA_PADDING = 10;

// Padding below the last control at the bottom of a screen. Android's gesture bar is shorter
// than the iPhone's home indicator, so keep at least Figma's 34 pt: the controls then sit
// where they do on iOS, plus the extra Android lift above.
export function bottomControlsPadding(safeAreaBottom: number): number {
  const androidExtra = Platform.OS === 'android' ? ANDROID_EXTRA_PADDING : 0;
  return Math.max(safeAreaBottom, MIN_BOTTOM_INSET) + GAP_ABOVE_BOTTOM_INSET + androidExtra;
}
