/**
 * Medikart palette (4.18). Light only: dark mode is V2-13 in the report.
 * Style taken from the Figma mockups (deep blue, white cards, soft grey chips); every text/background
 * pair used by the components is checked against WCAG AA in `theme.test.ts`.
 */
export const colors = {
  // Brand
  primary: '#0B3AA6',
  primaryPressed: '#082C7F',
  primarySoft: '#E8EDFB',
  onPrimary: '#FFFFFF',

  // Surfaces
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  overlay: 'rgba(17, 24, 39, 0.5)',
  transparent: 'transparent',

  // Text
  text: '#111827',
  textSecondary: '#4B5563',
  textDisabled: '#9CA3AF',

  // Lines: `divider` is decorative, `borderStrong` is the boundary of an input (3:1 on white).
  divider: '#E5E7EB',
  borderStrong: '#8A93A5',

  // Feedback
  danger: '#C62828',
  onDanger: '#FFFFFF',
  success: '#1B7F4B',
  disabledBackground: '#E5E7EB',

  // Decorative only (never carries text alone): rating star.
  star: '#F5A524',
} as const;

export type ColorName = keyof typeof colors;
