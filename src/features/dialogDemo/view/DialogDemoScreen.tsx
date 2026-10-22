import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../../shared/theme';
import { BackNavBar } from '../../../shared/ui/BackNavBar';
import { bottomControlsPadding } from '../../../shared/ui/bottomControlsPadding';
import { HeroBanner } from '../../../shared/ui/HeroBanner';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';
import { useDemoDialogs } from '../viewmodel/useDemoDialogs';

// Demo of the DialogManager with several dialogs (SPEC §8). Not in Figma: Home's background,
// the back nav bar, and three buttons for the brief's bonus question.
export function DialogDemoScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const demo = useDemoDialogs();

  return (
    <View style={styles.screen}>
      <HeroBanner />
      <View style={[styles.actions, { paddingBottom: bottomControlsPadding(insets.bottom) }]}>
        <PrimaryButton label={t('dialogDemo.oneDialog')} onPress={demo.showDialogA} />
        <PrimaryButton
          label={t('dialogDemo.sameFromTwoButtons')}
          onPress={demo.showSameFromTwoButtons}
        />
        <PrimaryButton label={t('dialogDemo.threeAtOnce')} onPress={demo.showThreeAtOnce} />
      </View>
      <BackNavBar />
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
