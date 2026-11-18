/** Spacing, radius, sizes and elevation (4.18). Spacing is a 4-point grid. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const sizes = {
  /** Report §7: touch targets of at least 44x44 pt. */
  minTouchTarget: 44,
  buttonHeight: 52,
  inputHeight: 52,
  chipHeight: 44,
  borderWidth: 1,
  loader: 32,
  /** Width of the splash logo, in dp: the same value as the native splash (assets/bootsplash). */
  splashLogo: 100,
  avatar: { sm: 32, md: 48, lg: 72, xl: 112 },
} as const;

export const elevation = {
  none: 0,
  card: 2,
} as const;

export type AvatarSize = keyof typeof sizes.avatar;
