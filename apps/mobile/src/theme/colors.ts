/**
 * Medikart palette (4.18). The values live in `@medikart/shared` (4.27), the single copy that the
 * web dashboard also uses: the mobile app and the dashboard cannot drift apart. Light only: dark
 * mode is V2-13 in the report. Every text/background pair used by the components is checked
 * against WCAG AA in `theme.test.ts`.
 */
export { colors, type ColorName } from '@medikart/shared';
