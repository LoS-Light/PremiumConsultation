import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { COLORS, GRADIENTS } from '../../../shared/theme';

const HERO_IMAGE = require('../../../../assets/images/consultation-hero.png');

// Hero photo banner of Specialists: a fixed background behind the content sheet (ADR-012).
// Square: as wide as the screen and as tall as it is wide.
export function ConsultationHero() {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.hero, { width, height: width }]}>
      <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={GRADIENTS.hero.colors}
        locations={GRADIENTS.hero.locations}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.heroBackground,
  },
});
