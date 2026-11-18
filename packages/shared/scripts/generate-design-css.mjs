// Writes src/design/tokens.css from the palette (src/design/colors.ts). Run: yarn generate:design
// Node 24 runs the TypeScript source directly (type stripping, hence the explicit .ts extensions), so there is no build step.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { brandFontName, colors } from '../src/design/colors.ts';
import { renderTokensCss } from '../src/design/css.ts';

const target = fileURLToPath(new URL('../src/design/tokens.css', import.meta.url));
writeFileSync(target, renderTokensCss(colors, brandFontName), 'utf8');
console.log(`Wrote ${target}`);
