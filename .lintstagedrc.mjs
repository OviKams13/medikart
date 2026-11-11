// lint-staged: ESLint first, then Prettier (4.12).
// ESLint is installed per project (apps/*, packages/*), not at the root. For each staged
// JS/TS file we find its workspace; if that workspace has an ESLint config we run its own
// ESLint on it. Commands of one list run one after the other, so Prettier always has the
// last word on formatting.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CODE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const ESLINT_CONFIGS = [
  'eslint.config.mjs',
  'eslint.config.js',
  'eslint.config.cjs',
  'eslint.config.ts',
];

// Forward slashes work everywhere, even on Windows; double quotes protect spaces.
const quote = (file) => `"${file.split(path.sep).join('/')}"`;

/** `packages/shared/src/a.ts` → `{ dir, name }` of its workspace, if it has an ESLint config. */
function workspaceWithEslint(file) {
  const [group, folder] = path.relative(ROOT, file).split(path.sep);
  if ((group !== 'apps' && group !== 'packages') || !folder) return null;
  const dir = path.join(ROOT, group, folder);
  if (!ESLINT_CONFIGS.some((name) => existsSync(path.join(dir, name)))) return null;
  const { name } = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
  return { dir, name };
}

export default {
  '*': (files) => {
    const byWorkspace = new Map();
    for (const file of files.filter((f) => CODE_FILE.test(f))) {
      const workspace = workspaceWithEslint(file);
      if (!workspace) continue;
      const entry = byWorkspace.get(workspace.name) ?? [];
      entry.push(file);
      byWorkspace.set(workspace.name, entry);
    }
    const eslint = [...byWorkspace].map(
      ([name, list]) =>
        `yarn workspace ${name} exec eslint --fix --no-warn-ignored ${list.map(quote).join(' ')}`,
    );
    const prettier = `prettier --write --ignore-unknown ${files.map(quote).join(' ')}`;
    return [...eslint, prettier];
  },
};
