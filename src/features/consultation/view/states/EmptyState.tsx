import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../../../../shared/theme';
import { CONTENT_PADDING_HORIZONTAL } from '../layout';

// No Specialists to show (SPEC §10): one line of centred grey text, no Retry.
export function EmptyState() {
  const { t } = useTranslation();
  return <Text style={styles.text}>{t('consultation.specialists.empty')}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingVertical: 32,
  },
});
