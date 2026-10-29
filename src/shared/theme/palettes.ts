// Semantic colours for light and dark mode (SPEC §11). Components use these names, never raw
// values. Light mode is the Figma design, with the Figma variable each colour comes from noted
// beside it. Figma has no dark mode: its greys, blue and green are iOS's dark system colours,
// and its yellows are darker versions of the light ones.
export const lightPalette = {
  textPrimary: '#000000', // Primay/Black
  textStrong: '#333333', // Primay/Dark Grey, the agreements notice
  textSecondary: '#555555', // Info/I8
  textMuted: '#A7A7A7', // Info/I6, secondary messages such as the empty state
  textOnPrimary: '#FFFFFF', // Info/I1, text on textStrong
  surface: '#FFFFFF', // B&W/White, the screens and sheets
  surfaceElevated: '#FFFFFF', // B&W/White, cards and dialogs above a surface
  actionBackground: '#000000', // Primay/Black, primary buttons
  actionText: '#FFFFFF', // Info/I1, a primary button's label
  heroBackground: '#FDF1C0', // Light Secounday/LY2
  heroGradientTop: 'rgba(151, 144, 115, 0.8)', // the hero overlay's top (not a variable)
  heroGradientBottom: 'rgba(253, 241, 192, 0)', // Light Secounday/LY2 at alpha 0
  noticeBackground: '#FFFAE5', // Light Secounday/LY3
  noticeBorder: '#F5E6A7', // Light Secounday/LY1
  divider: '#F5F5F5', // Vector 74 stroke (not a variable)
  placeholder: '#A7A7A7', // Info/I6, the Specialist photo placeholder
  skeleton: '#F7F7F7', // Neutral/N2
  link: '#007AFF', // contact links in Figma (not a variable)
  icon: '#333333', // the back arrow's stroke in Figma (not a variable)
  shadow: '#000000', // every drop shadow
  dialogBackdrop: 'rgba(0, 0, 0, 0.4)', // dims the screen behind a dialog (not in Figma)
  switchOn: '#34C759', // iOS system green, the switch's track when on (not in Figma)
  switchOff: '#E9E9EA', // iOS switch track when off (not in Figma)
  switchThumb: '#FFFFFF', // the switch's knob, white in both modes as on iOS (not in Figma)
  sheetHandle: '#C7C7CC', // the bottom sheet's drag handle (not in Figma)
  toastBackground: 'rgba(0, 0, 0, 0.8)', // the Toast demo's toasts (not in Figma)
  toastText: '#FFFFFF', // a toast's text (not in Figma)
  spinner: '#8E8E93', // iOS's activity indicator grey, the loading spinner (not in Figma)
};

export type Palette = Record<keyof typeof lightPalette, string>;

// Typed as Palette, so it must name every colour the light palette does.
export const darkPalette: Palette = {
  textPrimary: '#FFFFFF',
  textStrong: '#D1D1D6',
  textSecondary: '#AEAEB2',
  textMuted: '#8E8E93',
  textOnPrimary: '#000000',
  surface: '#1C1C1E',
  // Shadows barely show on a dark surface, so cards and dialogs stand out by being lighter.
  surfaceElevated: '#2C2C2E',
  // Primary buttons turn a muted gold, after the hero's yellow: they stand out on the dark
  // screen without the glare of white or grey.
  actionBackground: '#C9A227',
  actionText: '#000000',
  heroBackground: '#3D3520',
  heroGradientTop: 'rgba(0, 0, 0, 0.6)',
  heroGradientBottom: 'rgba(61, 53, 32, 0)',
  noticeBackground: '#2E2A1A',
  noticeBorder: '#5C522E',
  divider: '#38383A',
  placeholder: '#48484A',
  skeleton: '#3A3A3C',
  link: '#0A84FF',
  icon: '#FFFFFF',
  shadow: '#000000',
  dialogBackdrop: 'rgba(0, 0, 0, 0.6)',
  switchOn: '#30D158',
  switchOff: '#39393D',
  switchThumb: '#FFFFFF',
  sheetHandle: '#545458',
  // A dark grey toast with white text, as iOS shows in dark mode.
  toastBackground: 'rgba(58, 58, 60, 0.95)',
  toastText: '#FFFFFF',
  spinner: '#98989D',
};
