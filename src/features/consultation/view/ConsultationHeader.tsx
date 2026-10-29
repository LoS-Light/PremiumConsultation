import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { makeStyles, TYPOGRAPHY } from '../../../shared/theme';
import { CONTENT_GAP, CONTENT_PADDING_HORIZONTAL } from './layout';

// Top of the content sheet: overline, title, divider and description (Figma 2:139). Rendered
// as the header of the sheet's list.
export function ConsultationHeader() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <Text style={styles.overline}>{t('consultation.header.overline')}</Text>
      <Text style={styles.title}>{t('consultation.header.title')}</Text>
      <View style={styles.divider} />
      <Text style={styles.description}>{t('consultation.header.description')}</Text>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  header: {
    paddingTop: 32,
    paddingBottom: CONTENT_GAP,
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    gap: CONTENT_GAP,
  },
  overline: {
    ...TYPOGRAPHY.subtitle3,
    color: colors.textPrimary,
  },
  title: {
    ...TYPOGRAPHY.header2,
    color: colors.textSecondary,
  },
  // In Figma the divider is a 1 pt stroke on a zero-height line, so it takes no space.
  divider: {
    height: 1,
    marginVertical: -0.5,
    backgroundColor: colors.divider,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: colors.textSecondary,
  },
}));
