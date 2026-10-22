import {
  type GestureEventHandlerCallbackType,
  type GestureEventsHandlersHookType,
  useBottomSheetInternal,
  useGestureEventsHandlersDefault,
} from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { type SharedValue, useSharedValue, withSpring } from 'react-native-reanimated';

// iOS-style rubber band: the further the pull, the more it resists.
const STRETCH_LIMIT = 300;
const STRETCH_COEFFICIENT = 0.55;

function rubberBand(distance: number): number {
  'worklet';
  return (1 - 1 / ((distance * STRETCH_COEFFICIENT) / STRETCH_LIMIT + 1)) * STRETCH_LIMIT;
}

// Gesture handlers behind ElasticContentBottomSheet. When the sheet is at its lowest snap point
// and the user pulls down, the sheet itself stays put and its content stretches down and
// springs back, like a scroll view's bounce. Every other drag uses the library's defaults.
export function createElasticContentGestures(
  contentStretch: SharedValue<number>,
): GestureEventsHandlersHookType {
  return function useElasticContentGestures() {
    const defaults = useGestureEventsHandlersDefault();
    const { animatedIndex } = useBottomSheetInternal();
    const startedAtLowest = useSharedValue(false);

    const handleOnStart: GestureEventHandlerCallbackType = useCallback(
      (source, payload) => {
        'worklet';
        startedAtLowest.value = animatedIndex.value <= 0;
        defaults.handleOnStart(source, payload);
      },
      [animatedIndex, defaults, startedAtLowest],
    );

    const handleOnChange: GestureEventHandlerCallbackType = useCallback(
      (source, payload) => {
        'worklet';
        if (startedAtLowest.value && payload.translationY > 0) {
          contentStretch.value = rubberBand(payload.translationY);
          return;
        }
        contentStretch.value = 0;
        defaults.handleOnChange(source, payload);
      },
      [defaults, startedAtLowest],
    );

    const handleOnEnd: GestureEventHandlerCallbackType = useCallback(
      (source, payload) => {
        'worklet';
        if (contentStretch.value > 0) {
          contentStretch.value = withSpring(0);
          return;
        }
        defaults.handleOnEnd(source, payload);
      },
      [defaults],
    );

    const handleOnFinalize: GestureEventHandlerCallbackType = useCallback(
      (source, payload) => {
        'worklet';
        if (contentStretch.value > 0) {
          contentStretch.value = withSpring(0);
        }
        defaults.handleOnFinalize(source, payload);
      },
      [defaults],
    );

    return { handleOnStart, handleOnChange, handleOnEnd, handleOnFinalize };
  };
}
