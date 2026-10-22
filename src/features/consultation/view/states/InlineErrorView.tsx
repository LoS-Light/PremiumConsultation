import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../../../../shared/theme';
import { PrimaryButton } from '../../../../shared/ui/PrimaryButton';
import { CONTENT_PADDING_HORIZONTAL } from '../layout';

// Not in Figma: sized and spaced after the PRD screenshot, on the list's 8 pt grid.
const ICON_SIZE = 40;

// Loading the Specialists failed (SPEC §10): the PRD screenshot's layout, a dark circled "i",
// a title, a body and the one action, Retry. The same view for a failed first page (in the list
// body) and a failed next page (below the Specialists already shown).
export function InlineErrorView({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.view}>
      <View
        style={styles.icon}
        // Decoration: hidden with its "i" from VoiceOver and TalkBack ("no" alone would hide
        // only this view on Android, so TalkBack would still read the "i").
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.iconText}>i</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {t('consultation.error.title')}
      </Text>
      <Text style={styles.body}>{t('consultation.error.body')}</Text>
      <PrimaryButton label={t('consultation.error.retry')} onPress={onRetry} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
    paddingVertical: 32,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textStrong,
  },
  iconText: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textOnPrimary,
  },
  title: {
    ...TYPOGRAPHY.header6,
    color: COLORS.textPrimary,
  },
  body: {
    ...TYPOGRAPHY.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
});
