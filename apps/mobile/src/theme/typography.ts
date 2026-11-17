/**
 * Fonts and type scale (4.18).
 * Inter (SIL Open Font License 1.1), bundled in `assets/fonts` and linked through Gradle
 * (`android/app/build.gradle`). On Android a custom font is chosen by file name, so each
 * weight is its own family: never use `fontWeight` with these.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontWeightName = keyof typeof fontFamily;

export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 36 },
  title: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 30 },
  heading: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24 },
} as const;

export type TextVariant = keyof typeof typography;

/** Text follows the phone's font size, but never more than twice, so layouts do not break. */
export const maxFontSizeMultiplier = 2;
