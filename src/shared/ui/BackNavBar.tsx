import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import backIcon from '../../../assets/icons/back.svg';
import { makeStyles, useTheme } from '../theme';
import { ThrottledPressable } from './ThrottledPressable';

// Nav bar below the status bar: a 42 pt row plus 6 pt bottom padding (Figma "Fix Nav").
export const NAV_BAR_ROW_HEIGHT = 42;
export const NAV_BAR_BOTTOM_PADDING = 6;

// Transparent bar fixed over the hero with the back button (Figma "Fix Nav"), on every screen
// behind Home. The back button returns to the previous screen, as do the swipe back from the
// left edge and the Android back button.
export function BackNavBar() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // goBack() has no de-duplication of its own, and a second press can still reach the button
  // while its screen is leaving (it depends on timing); it would then go back from a screen that
  // is gone (a dev-mode "GO_BACK was not handled" error). The screen is no longer focused then,
  // so ignore the press.
  const handleBackPress = useCallback(() => {
    if (navigation.isFocused()) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]} pointerEvents="box-none">
      <View style={styles.row} pointerEvents="box-none">
        <ThrottledPressable
          accessibilityRole="button"
          accessibilityLabel={t('navBar.back')}
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Image
            source={backIcon}
            style={styles.backIconImage}
            contentFit="contain"
            // The icon is drawn dark; tint it so it shows on the dark hero too.
            tintColor={colors.icon}
          />
        </ThrottledPressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ shadows }) => ({
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
    ...shadows.navBar,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  backIconImage: {
    width: 20,
    height: 20,
  },
}));
