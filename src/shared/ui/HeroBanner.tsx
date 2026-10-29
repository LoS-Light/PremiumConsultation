import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import heroImage from '../../../assets/images/consultation-hero.png';
import { makeStyles, useTheme } from '../theme';

// Hero photo banner of Specialists, fixed at the top of the screen: behind the Consultation
// content sheet (ADR-012) and on Home (SPEC §4.1). Square: as wide as the screen and as tall.
export function HeroBanner() {
  const styles = useStyles();
  const { gradients } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.hero, { width, height: width }]}>
      <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={gradients.hero.colors}
        locations={gradients.hero.locations}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.heroBackground,
  },
}));
