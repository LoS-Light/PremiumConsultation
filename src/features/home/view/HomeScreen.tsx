import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGuardedNavigation } from '../../../shared/navigation/NavigationGuardProvider';
import { COLORS } from '../../../shared/theme';
import { bottomControlsPadding } from '../../../shared/ui/bottomControlsPadding';
import { HeroBanner } from '../../../shared/ui/HeroBanner';
import { PrimaryButton } from '../../../shared/ui/PrimaryButton';

// The app's entry point in v1.1.0 (SPEC §4.1). Not in Figma: it reuses the hero banner, whose
// gradient fades into the screen's background, and holds the entry button, placed like the
// Consultation screen's last button, with the dialog demo's button above it.
export function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { navigate } = useGuardedNavigation();

  return (
    <View style={styles.screen}>
      <HeroBanner />
      <View style={[styles.actions, { paddingBottom: bottomControlsPadding(insets.bottom) }]}>
        <PrimaryButton
          label={t('home.testMultipleDialogs')}
          onPress={() => navigate('DialogDemo')}
        />
        <PrimaryButton
          label={t('home.premiumConsultation')}
          onPress={() => navigate('Consultation')}
        />
      </View>
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
