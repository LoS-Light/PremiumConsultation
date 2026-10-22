import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SHADOWS, TYPOGRAPHY } from '../../../shared/theme';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useConsultationActions } from '../viewmodel/useConsultationActions';

// Figma: 10 pt between the content and the home indicator, which the safe-area inset covers.
const CONTENT_BOTTOM_PADDING = 10;

// Service hours and the two actions (PRD: they persist at the bottom of the page). Rendered as
// the content sheet's footer, so it stays at the bottom of the screen (ADR-012).
export function ConsultationBottomSection({
  onHeightChange,
}: {
  onHeightChange: (height: number) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const actions = useConsultationActions();

  return (
    <View
      style={[styles.section, { paddingBottom: insets.bottom + CONTENT_BOTTOM_PADDING }]}
      onLayout={(event: LayoutChangeEvent) => onHeightChange(event.nativeEvent.layout.height)}
    >
      <Text style={styles.serviceHours}>{t('consultation.bottomSection.serviceHours')}</Text>
      <PrimaryButton
        label={t('consultation.bottomSection.bookAppointment')}
        onPress={actions.bookAppointment}
      />
      <PrimaryButton
        label={t('consultation.bottomSection.whatsAppUs')}
        onPress={actions.whatsAppUs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...SHADOWS.bottomSection,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 20,
  },
  serviceHours: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
