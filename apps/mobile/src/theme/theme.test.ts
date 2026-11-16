import fs from 'fs';
import path from 'path';
import { colors } from './colors';
import { theme } from './index';

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('colors (report §7: AA contrast)', () => {
  // Every foreground/background pair the components use for text: at least 4.5:1.
  const textPairs: [string, string][] = [
    ['text', 'background'],
    ['text', 'surface'],
    ['text', 'surfaceMuted'],
    ['textSecondary', 'background'],
    ['textSecondary', 'surface'],
    ['textSecondary', 'surfaceMuted'],
    ['textSecondary', 'disabledBackground'],
    ['primary', 'background'],
    ['primary', 'primarySoft'],
    ['onPrimary', 'primary'],
    ['onPrimary', 'primaryPressed'],
    ['onDanger', 'danger'],
    ['danger', 'background'],
    ['success', 'background'],
  ];
  test.each(textPairs)('%s on %s is at least 4.5:1', (fg, bg) => {
    const ratio = contrast(colors[fg as keyof typeof colors], colors[bg as keyof typeof colors]);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('the border of an input is at least 3:1 against the background (non-text contrast)', () => {
    expect(contrast(colors.borderStrong, colors.background)).toBeGreaterThanOrEqual(3);
  });
});

describe('sizes and type', () => {
  test('touch targets are at least 44 pt (report §7)', () => {
    expect(theme.sizes.minTouchTarget).toBeGreaterThanOrEqual(44);
    expect(theme.sizes.buttonHeight).toBeGreaterThanOrEqual(44);
    expect(theme.sizes.inputHeight).toBeGreaterThanOrEqual(44);
    expect(theme.sizes.chipHeight).toBeGreaterThanOrEqual(44);
  });

  test('line height is larger than font size for every text style', () => {
    for (const style of Object.values(theme.typography)) {
      expect(style.lineHeight).toBeGreaterThan(style.fontSize);
    }
  });

  test('text can scale with the phone, at least up to 200 %', () => {
    expect(theme.maxFontSizeMultiplier).toBeGreaterThanOrEqual(2);
  });
});

describe('bundled fonts', () => {
  const fontsFolder = path.join(__dirname, '..', '..', 'assets', 'fonts');

  test.each(Object.values(theme.fontFamily))('%s.ttf is bundled in assets/fonts', (family) => {
    expect(fs.existsSync(path.join(fontsFolder, `${family}.ttf`))).toBe(true);
  });

  test('the font licence is shipped with the fonts', () => {
    expect(fs.existsSync(path.join(fontsFolder, 'OFL.txt'))).toBe(true);
  });

  test('Gradle packs the assets folder into the APK', () => {
    const gradle = fs.readFileSync(
      path.join(__dirname, '..', '..', 'android', 'app', 'build.gradle'),
      'utf8',
    );
    expect(gradle).toContain('assets.srcDirs += ["../../assets"]');
  });
});
