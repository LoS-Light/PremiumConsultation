import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGuardedNavigation } from '../../../shared/navigation/NavigationGuardProvider';
import { SHADOWS } from '../../../shared/theme';
import { ThrottledPressable } from '../../../shared/ui/ThrottledPressable';
import { NAV_BAR_BOTTOM_PADDING, NAV_BAR_ROW_HEIGHT } from './layout';

const BACK_ICON = require('../../../../assets/icons/back.svg');

// Transparent bar fixed over the hero. The back button returns to Home (v1.1.0), as do the swipe
// back from the left edge and the Android back button (SPEC §4.2).
export function ConsultationNavBar() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { goBack } = useGuardedNavigation();

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <ThrottledPressable
          testID="consultation-back"
          accessibilityRole="button"
          accessibilityLabel={t('consultation.navBar.back')}
          onPress={goBack}
          style={styles.backButton}
        >
          <Image source={BACK_ICON} style={styles.backIconImage} contentFit="contain" />
        </ThrottledPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: NAV_BAR_BOTTOM_PADDING,
  },
  row: {
    height: NAV_BAR_ROW_HEIGHT,
    justifyContent: 'center',
  },
  backButton: {
    ...SHADOWS.navBar,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backIconImage: {
    width: 20,
    height: 20,
  },
});
