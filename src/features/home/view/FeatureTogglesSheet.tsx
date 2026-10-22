import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type Ref, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY } from '../../../shared/theme';
import { bottomControlsPadding } from '../../../shared/ui/bottomControlsPadding';
import { ToggleSwitch } from '../../../shared/ui/ToggleSwitch';
import { useSheetAnimationConfigs } from '../../../shared/ui/useSheetAnimationConfigs';
import type { FeatureFlag } from '../../../shared/featureFlags/FeatureFlagService';
import { useFeatureToggle } from '../viewmodel/useFeatureToggle';

// The demo's feature toggles (SPEC §4.1, §7), opened from Home's Feature Toggle button: a
// bottom sheet sized to its content, closed by dragging it down or tapping outside it. The
// in-app switch is a demo shortcut; production flags would come from Firebase Remote Config
// or the CMS.
export function FeatureTogglesSheet({ ref }: { ref: Ref<BottomSheetModal> }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const animationConfigs = useSheetAnimationConfigs();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: bottomControlsPadding(insets.bottom) }]}
      >
        <Text style={styles.title} accessibilityRole="header">
          {t('featureToggles.title')}
        </Text>
        <FeatureToggleRow
          flag="premiumConsultation"
          label={t('featureToggles.premiumConsultation')}
          description={t('featureToggles.premiumConsultationDescription')}
        />
        <Text style={styles.tip}>{t('featureToggles.premiumConsultationTip')}</Text>
        <FeatureToggleRow
          flag="pressThrottle"
          label={t('featureToggles.pressThrottle')}
          description={t('featureToggles.pressThrottleDescription')}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// A flag's label and description, with its switch.
function FeatureToggleRow({
  flag,
  label,
  description,
}: {
  flag: FeatureFlag;
  label: string;
  description: string;
}) {
  const toggle = useFeatureToggle(flag);

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <ToggleSwitch
        isOn={toggle.isEnabled}
        onChange={toggle.setEnabled}
        accessibilityLabel={label}
        accessibilityHint={description}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    backgroundColor: COLORS.sheetHandle,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.textPrimary,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textSecondary,
  },
  tip: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textMuted,
  },
});
