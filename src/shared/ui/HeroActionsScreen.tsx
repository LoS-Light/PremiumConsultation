import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../theme';
import { BackNavBar } from './BackNavBar';
import { bottomControlsPadding } from './bottomControlsPadding';
import { HeroBanner } from './HeroBanner';

// The layout of Home and the demo screens (SPEC §4.1): the hero banner fading into its
// background, a content area that fills the middle, and buttons at the bottom placed like the
// Consultation screen's. Screens behind Home also get the back nav bar.
export function HeroActionsScreen({
  actions,
  hasBackButton = false,
  children,
}: {
  // The buttons at the bottom, from the top.
  actions: ReactNode;
  hasBackButton?: boolean;
  // What fills the space between the hero and the buttons, if anything.
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <HeroBanner />
      <View style={styles.content}>{children}</View>
      <View style={[styles.actions, { paddingBottom: bottomControlsPadding(insets.bottom) }]}>
        {actions}
      </View>
      {hasBackButton && <BackNavBar />}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.heroBackground,
  },
  content: {
    flex: 1,
  },
  actions: {
    paddingHorizontal: 16,
    gap: 20,
  },
});
