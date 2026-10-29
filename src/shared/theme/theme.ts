import { StyleSheet, useColorScheme, type ViewStyle } from 'react-native';

import { darkPalette, lightPalette, type Palette } from './palettes';

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  gradients: ReturnType<typeof createGradients>;
  shadows: ReturnType<typeof createShadows>;
}

function createGradients(colors: Palette) {
  return {
    // Hero overlay, top to bottom (Figma: down to the hero's background colour at alpha 0).
    hero: {
      colors: [colors.heroGradientTop, colors.heroGradientBottom],
      locations: [0, 0.82692],
    },
  } as const;
}

function createShadows(colors: Palette) {
  return {
    // Bottom section: Figma drop shadow 8 8 15 rgba(0, 0, 0, 0.08); iOS radius is half the blur.
    bottomSection: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 7.5,
      elevation: 8,
    },
    // Specialist card: Figma shadow 0 4 10 rgba(0, 0, 0, 0.1). Figma's blur is a CSS blur
    // radius; iOS shadowRadius is about half of it.
    card: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    // Switch thumb: iOS's soft shadow under the white knob.
    switchThumb: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    // Nav bar content: drop shadow 0 4 10 rgba(0, 0, 0, 0.05)
    navBar: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
  } satisfies Record<string, ViewStyle>;
}

function createTheme(scheme: ColorScheme, colors: Palette): Theme {
  return { scheme, colors, gradients: createGradients(colors), shadows: createShadows(colors) };
}

// Built once each; useTheme hands out the same object for as long as the scheme stays.
const THEMES: Record<ColorScheme, Theme> = {
  light: createTheme('light', lightPalette),
  dark: createTheme('dark', darkPalette),
};

// The theme for the system's appearance. useColorScheme re-renders the caller when the user
// switches between light and dark mode, so everything read from the theme follows.
export function useTheme(): Theme {
  return THEMES[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// What StyleSheet.create takes: named styles.
type StyleSheetInput = Parameters<typeof StyleSheet.create>[0];

// Turns a style sheet that reads the theme into a hook. The sheet is built once per scheme
// and shared by every component that uses it, as StyleSheet.create at module level was:
//
//   const useStyles = makeStyles(({ colors }) => ({ text: { color: colors.textMuted } }));
//   function EmptyState() {
//     const styles = useStyles();
//     …
//   }
export function makeStyles<S extends StyleSheetInput>(
  createStyles: (theme: Theme) => S & StyleSheetInput,
): () => Readonly<S> {
  const sheets = new Map<ColorScheme, Readonly<S>>();
  return function useStyles() {
    const theme = useTheme();
    let sheet = sheets.get(theme.scheme);
    if (sheet === undefined) {
      sheet = StyleSheet.create(createStyles(theme));
      sheets.set(theme.scheme, sheet);
    }
    return sheet;
  };
}
