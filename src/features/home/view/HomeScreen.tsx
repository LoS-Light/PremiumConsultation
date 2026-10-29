import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { HeroActionsScreen } from '../../../shared/ui/HeroActionsScreen';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useConsultationEntry } from '../viewmodel/useConsultationEntry';
import { FeatureTogglesSheet } from './FeatureTogglesSheet';

// The app's entry point in v1.1.0 (SPEC §4.1). Not in Figma: the hero banner over four buttons,
// from the top the entry button, the feature toggles', the dialog demo's and the toast demo's.
export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const openConsultation = useConsultationEntry();
  const featureTogglesRef = useRef<BottomSheetModal>(null);
  const handleFeatureTogglesPress = useCallback(() => featureTogglesRef.current?.present(), []);
  const handleDialogDemoPress = useCallback(() => navigation.navigate('DialogDemo'), [navigation]);
  const handleToastDemoPress = useCallback(() => navigation.navigate('ToastDemo'), [navigation]);

  return (
    <>
      <HeroActionsScreen
        actions={
          <>
            <PrimaryButton label={t('home.premiumConsultation')} onPress={openConsultation} />
            <PrimaryButton label={t('home.featureToggle')} onPress={handleFeatureTogglesPress} />
            <PrimaryButton label={t('home.testMultipleDialogs')} onPress={handleDialogDemoPress} />
            <PrimaryButton label={t('home.testToasts')} onPress={handleToastDemoPress} />
          </>
        }
      />
      <FeatureTogglesSheet ref={featureTogglesRef} />
    </>
  );
}
