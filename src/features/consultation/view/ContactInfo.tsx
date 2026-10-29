import { Trans } from 'react-i18next';
import { Text } from 'react-native';

import { EMAIL, HOTLINE_DISPLAY } from '../../../shared/config/contact';
import { makeStyles, TYPOGRAPHY } from '../../../shared/theme';
import { useThrottledPress } from '../../../shared/ui/useThrottledPress';
import { useConsultationActions } from '../viewmodel/useConsultationActions';

// General enquiries (PRD). <Trans> lets each language keep its own sentence structure (English
// lists the hotline and email on their own lines; Chinese puts them inline) while both stay
// tappable links. The links use the shared press throttle (SPEC §8a).
export function ContactInfo() {
  const styles = useStyles();
  const actions = useConsultationActions();
  const handleHotlinePress = useThrottledPress(actions.callHotline);
  const handleEmailPress = useThrottledPress(actions.emailUs);

  return (
    <Text style={styles.text}>
      <Trans
        i18nKey="consultation.contactInfo"
        values={{ hotline: HOTLINE_DISPLAY, email: EMAIL }}
        components={{
          hotline: (
            <Text style={styles.link} onPress={handleHotlinePress} accessibilityRole="link" />
          ),
          email: <Text style={styles.link} onPress={handleEmailPress} accessibilityRole="link" />,
        }}
      />
    </Text>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  text: {
    ...TYPOGRAPHY.body3,
    color: colors.textSecondary,
  },
  link: {
    color: colors.link,
  },
}));
