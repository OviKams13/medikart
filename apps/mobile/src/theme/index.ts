import { colors } from './colors';
import { elevation, radius, sizes, spacing } from './layout';
import { fontFamily, maxFontSizeMultiplier, typography } from './typography';

/**
 * The only place for colors, fonts, sizes and spacing (4.18). Components read the theme and
 * never hard-code these values (ESLint enforces it outside `src/theme`).
 */
export const theme = {
  colors,
  fontFamily,
  typography,
  maxFontSizeMultiplier,
  spacing,
  radius,
  sizes,
  elevation,
} as const;

export type Theme = typeof theme;

/** Single theme for now (light). A hook so a dark theme can be added later without touching components. */
export function useTheme(): Theme {
  return theme;
}

export type { ColorName } from './colors';
export type { TextVariant, FontWeightName } from './typography';
export type { AvatarSize } from './layout';
