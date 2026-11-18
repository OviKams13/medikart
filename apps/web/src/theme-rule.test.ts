// @vitest-environment node
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

// The "theme values only" rule of the dashboard (4.26), proven on real code snippets.
const eslint = new ESLint({ cwd: fileURLToPath(new URL('..', import.meta.url)) });

async function messages(code: string, filePath = 'src/example.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: fileURLToPath(new URL(`../${filePath}`, import.meta.url)),
  });
  return (result?.messages ?? []).filter((m) => m.ruleId === 'no-restricted-syntax');
}

const page = (body: string) => `export function Example() {\n  return ${body};\n}\n`;

describe('theme values only', () => {
  test.each([
    ['a hex color', page(`<p className="x" data-c={'#0B3AA6'} />`)],
    ['an rgb() color', page(`<p data-c={'rgb(1, 2, 3)'} />`)],
    ['an inline style', page(`<p style={{ margin: 0 }} />`)],
    ['an arbitrary color class', page(`<p className="bg-[#fff] p-2" />`)],
    ['an arbitrary size class', page(`<p className="p-[13px]" />`)],
    ['an arbitrary size in a template', page('<p className={`w-[2rem] ${x}`} />')],
    ['a color outside the palette', page(`<p className="text-sm bg-blue-500" />`)],
    ['a default white', page(`<p className="text-white" />`)],
  ])('forbids %s', async (_name, code) => {
    const found = await messages(code);
    expect(found.length).toBeGreaterThan(0);
  });

  test.each([
    [
      'theme classes',
      page(`<p className="bg-primary text-on-primary p-4 rounded-lg text-text-secondary" />`),
    ],
    [
      'sizes from the scale',
      page(`<p className="size-6 min-h-11 w-64 gap-2 border border-divider" />`),
    ],
    ['a relative size', page(`<p className="w-1/2 w-full" />`)],
  ])('allows %s', async (_name, code) => {
    expect(await messages(code)).toEqual([]);
  });

  test('tests are exempt, so they can use literals', async () => {
    expect(await messages(page(`<p style={{ margin: 0 }} />`), 'src/example.test.tsx')).toEqual([]);
  });

  test('the datetime rule of @medikart/shared is also active in the dashboard (4.14)', async () => {
    const found = await messages(
      `export const label = (d: Date) => d.toLocaleDateString('fr');\n`,
      'src/example.ts',
    );
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.message).toMatch(/datetime/i);
  });
});
