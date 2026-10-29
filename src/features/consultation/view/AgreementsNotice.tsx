import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import infoIcon from '../../../../assets/icons/info.svg';
import { COLORS, TYPOGRAPHY } from '../../../shared/theme';

// Privacy notice in a pale yellow box (Figma 2:208).
export function AgreementsNotice() {
  const { t } = useTranslation();

  return (
    <View style={styles.box}>
      <Image source={infoIcon} style={styles.icon} contentFit="contain" />
      <Text style={styles.text}>{t('consultation.agreements')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.noticeBorder,
    backgroundColor: COLORS.noticeBackground,
  },
  icon: {
    width: 16,
    height: 16,
    marginTop: 1,
  },
  // Figma fixes the justified text at 260 pt wide; a different width spreads the words
  // differently.
  text: {
    ...TYPOGRAPHY.body3,
    width: 260,
    color: COLORS.textStrong,
    textAlign: 'justify',
  },
});
