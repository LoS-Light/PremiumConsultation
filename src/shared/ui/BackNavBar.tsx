import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHADOWS } from '../theme';
import { ThrottledPressable } from './ThrottledPressable';

// Nav bar below the status bar: a 42 pt row plus 6 pt bottom padding (Figma "Fix Nav").
export const NAV_BAR_ROW_HEIGHT = 42;
export const NAV_BAR_BOTTOM_PADDING = 6;

const BACK_ICON = require('../../../assets/icons/back.svg');

// Transparent bar fixed over the hero with the back button (Figma "Fix Nav"), on every screen
// behind Home. The back button returns to the previous screen, as do the swipe back from the
// left edge and the Android back button. A second press can't go back twice: the stack stops
// touches on a screen that is leaving.
export function BackNavBar() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <ThrottledPressable
          accessibilityRole="button"
          accessibilityLabel={t('navBar.back')}
          onPress={() => navigation.goBack()}
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
