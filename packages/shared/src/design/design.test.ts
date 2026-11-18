import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { brandFontName, colors, renderTokensCss, toKebabCase } from './index';

describe('design tokens (4.27)', () => {
  test('every color is a hex value, rgba() or transparent', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^(#[0-9A-F]{6}|rgba\([\d., ]+\)|transparent)$/);
    }
  });

  test('the brand blue and font are the ones approved for the mobile app (4.18)', () => {
    expect(colors.primary).toBe('#0B3AA6');
    expect(brandFontName).toBe('Inter');
  });

  test('kebab-case names for Tailwind', () => {
    expect(toKebabCase('primarySoft')).toBe('primary-soft');
    expect(toKebabCase('onPrimary')).toBe('on-primary');
    expect(toKebabCase('text')).toBe('text');
  });

  test('tokens.css is exactly what the palette generates (run `yarn generate:design` if this fails)', () => {
    const committed = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8').replace(
      /\r\n/g,
      '\n',
    );
    expect(committed).toBe(renderTokensCss(colors, brandFontName));
  });

  test('the generated CSS has every color and removes the default Tailwind palette', () => {
    const css = renderTokensCss(colors, brandFontName);
    expect(css).toContain('--color-*: initial;');
    for (const [name, value] of Object.entries(colors)) {
      expect(css).toContain(`--color-${toKebabCase(name)}: ${value};`);
    }
    expect(css).toContain("--font-sans: 'Inter'");
  });
});
