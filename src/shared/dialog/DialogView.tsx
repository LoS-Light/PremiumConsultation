import { Modal, StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../theme';
import { PrimaryButton } from '../ui/PrimaryButton';

export interface DialogContent {
  title: string;
  body: string;
  buttonLabel: string;
}

// A centred dialog with one button (SPEC §8). Not in Figma: a white card on a dimmed screen,
// with the Figma text styles and the black primary button. A custom component rather than
// Alert.alert, so it looks the same on iOS and Android and the DialogManager decides when it
// shows. The Android back button closes it, like its button.
export function DialogView({
  content,
  onClose,
}: {
  content: DialogContent | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={content !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {content !== null && (
          <View style={styles.card} accessibilityViewIsModal>
            <Text style={styles.title} accessibilityRole="header">
              {content.title}
            </Text>
            <Text style={styles.body}>{content.body}</Text>
            <PrimaryButton label={content.buttonLabel} onPress={onClose} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.dialogBackdrop,
  },
  card: {
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
