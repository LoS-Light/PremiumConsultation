import { Modal, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOWS, TYPOGRAPHY } from '../theme';
import { PrimaryButton } from '../ui/PrimaryButton';

export interface DialogContent {
  title: string;
  body: string;
  buttonLabel: string;
}

// How far each dialog under the top one peeks out above it, and how much smaller it is.
const STACK_OFFSET = 14;
const STACK_SCALE_STEP = 0.04;

// Centred dialogs with one button (SPEC §8). Not in Figma: a white card on a dimmed screen,
// with the Figma text styles and the black primary button. A custom component rather than
// Alert.alert, so it looks the same on iOS and Android and the DialogManager decides when it
// shows. Normally one dialog shows at a time; with the queue switched off for the demo, they
// stack, each older one peeking out above the next, and only the top one can be pressed. The
// Android back button closes the top one, like its button.
export function DialogView({
  dialogs,
  onClose,
}: {
  // Oldest first: the last one is on top. The key tells the queue which one to close.
  dialogs: { key: number; content: DialogContent }[];
  onClose: (key: number) => void;
}) {
  const top = dialogs[dialogs.length - 1];

  return (
    <Modal
      visible={dialogs.length > 0}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {
        if (top !== undefined) {
          onClose(top.key);
        }
      }}
    >
      <View style={styles.backdrop}>
        {dialogs.map(({ key, content }, index) => {
          const depth = dialogs.length - 1 - index;
          const isTop = depth === 0;
          return (
            <View
              key={key}
              style={[
                styles.layer,
                {
                  transform: [
                    { translateY: -STACK_OFFSET * depth },
                    { scale: 1 - STACK_SCALE_STEP * depth },
                  ],
                },
              ]}
              pointerEvents={isTop ? 'box-none' : 'none'}
              importantForAccessibility={isTop ? 'auto' : 'no-hide-descendants'}
              accessibilityElementsHidden={!isTop}
            >
              <View style={styles.card} accessibilityViewIsModal={isTop}>
                <Text style={styles.title} accessibilityRole="header">
                  {content.title}
                </Text>
                <Text style={styles.body}>{content.body}</Text>
                <PrimaryButton label={content.buttonLabel} onPress={() => onClose(key)} />
              </View>
            </View>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.dialogBackdrop,
  },
  // Each dialog is centred on its own layer, so stacked ones line up.
  layer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    ...SHADOWS.card,
    width: '100%',
    maxWidth: 343,
    alignSelf: 'center',
    gap: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  title: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
