import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../../../shared/theme';
import { cardStyles } from '../SpecialistCard';
import { CONTENT_GAP, CONTENT_PADDING_HORIZONTAL } from '../layout';

const SKELETON_COUNT = 3;

// Placeholder cards, the same size as SpecialistCard, shown while the Specialists load
// (SPEC §10).
export function SpecialistSkeleton() {
  return (
    <View style={styles.list}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <View key={index} testID="specialist-skeleton" style={cardStyles.card}>
          <View style={cardStyles.row}>
            <View style={[cardStyles.photo, styles.block]} />
            <View style={[styles.block, styles.nameLine]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    gap: CONTENT_GAP,
  },
  block: {
    backgroundColor: COLORS.skeleton,
  },
  nameLine: {
    width: 96,
    height: 14,
    borderRadius: 4,
  },
});
