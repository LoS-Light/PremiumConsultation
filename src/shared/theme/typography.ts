import type { TextStyle } from 'react-native';

// The design is drawn on a 390 pt wide frame.
export const DESIGN_WIDTH = 390;

// Each loaded font file with its weight. The weight matters for text the font has no glyphs
// for: Inter has no Chinese, so Chinese falls back to the system font, which picks its weight
// from fontWeight. iOS infers it from the font file; Android shows Regular unless it is set.
const FONTS = {
  interMedium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
  interSemiBold: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
  interBold: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
  notoSansTcBold: { fontFamily: 'NotoSansTC_700Bold', fontWeight: '700' },
} as const satisfies Record<string, Pick<TextStyle, 'fontFamily' | 'fontWeight'>>;

const LINE_HEIGHT_RATIO = 1.5;

function textStyle(font: (typeof FONTS)[keyof typeof FONTS], fontSize: number): TextStyle {
  return { ...font, fontSize, lineHeight: fontSize * LINE_HEIGHT_RATIO, letterSpacing: 0 };
}

// Text styles from the Figma variables (SPEC §11). They carry no colour, so they are the same
// in light and dark mode.
export const TYPOGRAPHY = {
  subtitle3: textStyle(FONTS.interMedium, 14), // English/Subtitle/Subtitle 3
  subtitle1: textStyle(FONTS.interBold, 14), // English/Subtitle/Subtitle 1
  body3: textStyle(FONTS.interMedium, 12), // English/Body/Body 3
  header2: textStyle(FONTS.notoSansTcBold, 22), // Chinese/Header/Header 2
  header6: textStyle(FONTS.interSemiBold, 16), // English/Header/Header 6
} as const;
