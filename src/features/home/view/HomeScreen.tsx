import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../../shared/theme';
import { bottomControlsPadding } from '../../../shared/ui/bottomControlsPadding';
import { HeroBanner } from '../../../shared/ui/HeroBanner';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useConsultationEntry } from '../viewmodel/useConsultationEntry';
import { FeatureTogglesSheet } from './FeatureTogglesSheet';

// The app's entry point in v1.1.0 (SPEC §4.1). Not in Figma: it reuses the hero banner, whose
// gradient fades into the screen's background, and holds three buttons at the bottom, placed
// like the Consultation screen's buttons: the entry button, the feature toggles' and the dialog
// demo's.
export function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const openConsultation = useConsultationEntry();
  const featureTogglesRef = useRef<BottomSheetModal>(null);

  return (
    <View style={styles.screen}>
      <HeroBanner />
      <View style={[styles.actions, { paddingBottom: bottomControlsPadding(insets.bottom) }]}>
        <PrimaryButton label={t('home.premiumConsultation')} onPress={openConsultation} />
        <PrimaryButton
          label={t('home.featureToggle')}
          onPress={() => featureTogglesRef.current?.present()}
        />
        <PrimaryButton
          label={t('home.testMultipleDialogs')}
          onPress={() => navigation.navigate('DialogDemo')}
        />
      </View>
      <FeatureTogglesSheet ref={featureTogglesRef} />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.heroBackground,
  },
  actions: {
    paddingHorizontal: 16,
    gap: 20,
  },
});
