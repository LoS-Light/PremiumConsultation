import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { makeStyles, TYPOGRAPHY } from '../../../../shared/theme';
import { CONTENT_PADDING_HORIZONTAL } from '../layout';

// No Specialists to show (SPEC §10): one line of centred grey text, no Retry.
export function EmptyState() {
  const styles = useStyles();
  const { t } = useTranslation();
  return <Text style={styles.text}>{t('consultation.specialists.empty')}</Text>;
}

const useStyles = makeStyles(({ colors }) => ({
  text: {
    ...TYPOGRAPHY.body3,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingVertical: 32,
  },
}));
