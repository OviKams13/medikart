// Tests of the ESLint rule that forbids date formatting outside the datetime module (4.14, D1.5-01).
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { datetimeRestrictions } from './index.mjs';

const packageDir = fileURLToPath(new URL('..', import.meta.url));

/** The reusable block alone, as an app would apply it. */
const appEslint = new ESLint({
  cwd: packageDir,
  overrideConfigFile: true,
  overrideConfig: datetimeRestrictions(),
});

/** The real configuration of this package (with the exemption of the datetime module). */
const packageEslint = new ESLint({ cwd: packageDir });

async function ruleIds(eslint, code, filePath) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((m) => m.ruleId);
}

describe('forbidden outside the datetime module', () => {
  it.each([
    ['dayjs import', "import dayjs from 'dayjs';\ndayjs();", 'no-restricted-imports'],
    ['dayjs plugin import', "import utc from 'dayjs/plugin/utc';\nutc;", 'no-restricted-imports'],
    ['moment import', "import moment from 'moment';\nmoment();", 'no-restricted-imports'],
    ['date-fns import', "import { format } from 'date-fns';\nformat;", 'no-restricted-imports'],
    ['luxon import', "import { DateTime } from 'luxon';\nDateTime;", 'no-restricted-imports'],
    ['toLocaleDateString', 'new Date().toLocaleDateString("fr");', 'no-restricted-syntax'],
    ['toLocaleTimeString', 'date.toLocaleTimeString();', 'no-restricted-syntax'],
    ['toLocaleString', 'date.toLocaleString("en-US");', 'no-restricted-syntax'],
    ['toISOString', 'const s = date.toISOString();', 'no-restricted-syntax'],
    ['toDateString', 'date.toDateString();', 'no-restricted-syntax'],
    ['toUTCString', 'date.toUTCString();', 'no-restricted-syntax'],
    ['getHours', 'const h = date.getHours();', 'no-restricted-syntax'],
    ['getUTCMinutes', 'const m = date.getUTCMinutes();', 'no-restricted-syntax'],
    ['getFullYear', 'date.getFullYear();', 'no-restricted-syntax'],
    ['getDay', 'date.getDay();', 'no-restricted-syntax'],
    ['new Intl.DateTimeFormat', 'new Intl.DateTimeFormat("fr").format(d);', 'no-restricted-syntax'],
    ['Intl.DateTimeFormat call', 'Intl.DateTimeFormat("fr");', 'no-restricted-syntax'],
    ['Intl.RelativeTimeFormat', 'new Intl.RelativeTimeFormat("en");', 'no-restricted-syntax'],
  ])('%s', async (_name, code, expectedRule) => {
    const ids = await ruleIds(appEslint, code, 'app.js');
    expect(ids).toContain(expectedRule);
  });

  it('the message tells where to go', async () => {
    const [result] = await appEslint.lintText('date.toISOString();', { filePath: 'app.js' });
    expect(result.messages[0].message).toContain("'datetime' module of @medikart/shared");
  });
});

describe('still allowed', () => {
  it.each([
    ['clock reading', 'const now = Date.now();'],
    ['Date construction', 'const d = new Date(0);'],
    ['getTime', 'const t = d.getTime();'],
    ['number formatting', 'new Intl.NumberFormat("fr-FR").format(45000);'],
    ['the shared package', "import { formatTime } from '@medikart/shared';\nformatTime;"],
    ['unrelated getters', 'map.get("a");\nlist.getDate;'],
  ])('%s', async (_name, code) => {
    expect(await ruleIds(appEslint, code, 'app.js')).toEqual([]);
  });
});

describe('the datetime module is the only exemption', () => {
  const code = "import dayjs from 'dayjs';\nexport const f = () => dayjs().toISOString();\n";

  it('inside src/datetime/', async () => {
    expect(await ruleIds(packageEslint, code, `${packageDir}src/datetime/example.ts`)).toEqual([]);
  });

  it('anywhere else in the package, tests included', async () => {
    const ids = await ruleIds(packageEslint, code, `${packageDir}src/other.ts`);
    expect(ids).toContain('no-restricted-imports');
    expect(ids).toContain('no-restricted-syntax');
  });
});
