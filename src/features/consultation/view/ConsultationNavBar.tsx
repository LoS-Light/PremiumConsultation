import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SHADOWS } from '../../../shared/theme';
import { NAV_BAR_BOTTOM_PADDING, NAV_BAR_ROW_HEIGHT } from './layout';

const BACK_ICON = require('../../../../assets/icons/back.svg');

// Transparent bar fixed over the hero. The back icon is drawn for visual fidelity only:
// the PRD says pressing it does nothing (v1.0.0), so it is not a button and is hidden from
// screen readers rather than announced as a button that does nothing.
export function ConsultationNavBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <View
          testID="consultation-back"
          style={styles.backIcon}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Image source={BACK_ICON} style={styles.backIconImage} contentFit="contain" />
        </View>
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
  backIcon: {
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
