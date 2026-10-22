import type { TextStyle, ViewStyle } from 'react-native';

// Design tokens from the Figma variables (SPEC §11). Components use these semantic names,
// never raw hex values. The Figma variable each token comes from is noted beside it.
export const COLORS = {
  textPrimary: '#000000', // Primay/Black
  textSecondary: '#555555', // Info/I8
  surface: '#FFFFFF', // B&W/White
  heroBackground: '#FDF1C0', // Light Secounday/LY2
  divider: '#F5F5F5', // Vector 74 stroke (not a variable)
  placeholder: '#A7A7A7', // Info/I6, the Specialist photo placeholder
  textMuted: '#A7A7A7', // Info/I6, secondary messages such as the empty state
  skeleton: '#F7F7F7', // Neutral/N2
} as const;

// The design is drawn on a 390 pt wide frame.
export const DESIGN_WIDTH = 390;

const FONTS = {
  interMedium: 'Inter_500Medium',
  interBold: 'Inter_700Bold',
  notoSansTcBold: 'NotoSansTC_700Bold',
} as const;

const LINE_HEIGHT_RATIO = 1.5;

function textStyle(fontFamily: string, fontSize: number): TextStyle {
  return { fontFamily, fontSize, lineHeight: fontSize * LINE_HEIGHT_RATIO, letterSpacing: 0 };
}

// Hero overlay: top to bottom, from rgba(151, 144, 115, 0.8) to Light Secounday/LY2 at alpha 0.
export const GRADIENTS = {
  hero: {
    colors: ['rgba(151, 144, 115, 0.8)', 'rgba(253, 241, 192, 0)'],
    locations: [0, 0.82692],
  },
} as const;

export const TYPOGRAPHY = {
  subtitle3: textStyle(FONTS.interMedium, 14), // English/Subtitle/Subtitle 3
  subtitle1: textStyle(FONTS.interBold, 14), // English/Subtitle/Subtitle 1
  body3: textStyle(FONTS.interMedium, 12), // English/Body/Body 3
  header2: textStyle(FONTS.notoSansTcBold, 22), // Chinese/Header/Header 2
} as const;

export const SHADOWS = {
  // Specialist card: Figma shadow 0 4 10 rgba(0, 0, 0, 0.1). Figma's blur is a CSS blur
  // radius; iOS shadowRadius is about half of it.
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  // Nav bar content: drop shadow 0 4 10 rgba(0, 0, 0, 0.05)
  navBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
} satisfies Record<string, ViewStyle>;
