import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, TYPOGRAPHY } from '../../../shared/theme';
import { bottomControlsPadding } from '../../../shared/ui/bottomControlsPadding';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useConsultationActions } from '../viewmodel/useConsultationActions';
import { VERTICAL_DRAG_THRESHOLD } from './layout';

// Service hours and the two actions (PRD: they persist at the bottom of the page). Rendered as
// the content sheet's footer, so it stays at the bottom of the screen (ADR-012).
export function ConsultationBottomSection({
  onHeightChange,
}: {
  onHeightChange: (height: number) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const actions = useConsultationActions();
  // The sheet's drag gesture covers its footer too. This pan does nothing but claims drags that
  // start on the bottom section, so the section stays fixed and the sheet doesn't move. Taps
  // still reach the buttons.
  // Like the sheet, it only claims vertical drags, so a swipe back from the edge still works.
  const blockSheetDrag = useMemo(
    () => Gesture.Pan().activeOffsetY(VERTICAL_DRAG_THRESHOLD).failOffsetX(VERTICAL_DRAG_THRESHOLD),
    [],
  );
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => onHeightChange(event.nativeEvent.layout.height),
    [onHeightChange],
  );

  return (
    <GestureDetector gesture={blockSheetDrag}>
      <View
        style={[styles.section, { paddingBottom: bottomControlsPadding(insets.bottom) }]}
        onLayout={handleLayout}
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
    </GestureDetector>
  );
}

const useStyles = makeStyles(({ colors, shadows }) => ({
  section: {
    ...shadows.bottomSection,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 20,
  },
  serviceHours: {
    ...TYPOGRAPHY.body3,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}));
