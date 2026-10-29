import { View } from 'react-native';

import { makeStyles } from '../../../../shared/theme';
import { useCardStyles } from '../SpecialistCard';
import { CONTENT_GAP, CONTENT_PADDING_HORIZONTAL } from '../layout';

const SKELETON_COUNT = 3;

// Placeholder cards, the same size as SpecialistCard, shown while the Specialists load
// (SPEC §10).
export function SpecialistSkeleton() {
  const styles = useStyles();
  const cardStyles = useCardStyles();
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

const useStyles = makeStyles(({ colors }) => ({
  list: {
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    gap: CONTENT_GAP,
  },
  block: {
    backgroundColor: colors.skeleton,
  },
  nameLine: {
    width: 96,
    height: 14,
    borderRadius: 4,
  },
}));
