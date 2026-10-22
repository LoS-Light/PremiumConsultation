import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { COLORS, DESIGN_WIDTH, GRADIENTS, TYPOGRAPHY } from '../../../shared/theme';
import { CONTENT_GAP, CONTENT_PADDING_HORIZONTAL } from './layout';

const HERO_IMAGE = require('../../../../assets/images/consultation-hero.png');

// In Figma the hero is 390 × 390 and the white card starts at y = 230, overlapping it.
const CARD_TOP_IN_DESIGN = 230;

// Hero photo banner plus the top of the white content card (overline, title, divider,
// description). Rendered as the FlatList header (ADR-005).
export function ConsultationHeader() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  // The hero is square: as wide as the screen, and as tall as it is wide.
  const cardOverlap = width - (CARD_TOP_IN_DESIGN * width) / DESIGN_WIDTH;

  return (
    // overflow: hidden stops the lower part of the hero spilling below the header.
    <View style={styles.header}>
      <View style={[styles.hero, { width, height: width }]}>
        <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={GRADIENTS.hero.colors}
          locations={GRADIENTS.hero.locations}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.card, { marginTop: -cardOverlap }]}>
        <Text style={styles.overline}>{t('consultation.header.overline')}</Text>
        <Text style={styles.title}>{t('consultation.header.title')}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{t('consultation.header.description')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: 'hidden',
  },
  hero: {
    backgroundColor: COLORS.heroBackground,
  },
  // Figma gives the card a drop shadow offset 8 pt down, but the card runs to the bottom of
  // the page, so the shadow never shows; drawing it here would leave a line under the header.
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingBottom: CONTENT_GAP,
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    gap: CONTENT_GAP,
  },
  overline: {
    ...TYPOGRAPHY.subtitle3,
    color: COLORS.textPrimary,
  },
  title: {
    ...TYPOGRAPHY.header2,
    color: COLORS.textSecondary,
  },
  // In Figma the divider is a 1 pt stroke on a zero-height line, so it takes no space.
  divider: {
    height: 1,
    marginVertical: -0.5,
    backgroundColor: COLORS.divider,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textSecondary,
  },
});
