import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { Specialist } from '../../../domain/specialist/Specialist';
import { makeStyles, TYPOGRAPHY } from '../../../shared/theme';

// Static card: photo and name, no interaction (PRD). Figma card 2:155.
export function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const styles = useStyles();
  const cardStyles = useCardStyles();
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        {specialist.avatarUrl ? (
          <Image
            source={{ uri: specialist.avatarUrl }}
            style={cardStyles.photo}
            contentFit="cover"
          />
        ) : (
          <View style={[cardStyles.photo, styles.placeholder]} />
        )}
        <Text style={styles.name} testID="specialist-name">
          {specialist.name}
        </Text>
      </View>
    </View>
  );
}

// Shared with the loading skeleton, which mirrors the card's size.
export const useCardStyles = makeStyles(({ colors, shadows }) => ({
  card: {
    ...shadows.card,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 13.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 27,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 6.667,
  },
}));

const useStyles = makeStyles(({ colors }) => ({
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  name: {
    ...TYPOGRAPHY.subtitle1,
    color: colors.textSecondary,
    flex: 1,
  },
}));
