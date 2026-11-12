// Regenerates src/api/generated/schema.ts from the backend's OpenAPI document (4.15).
// The backend must be running (local Docker: `cd backend; .\mvnw.cmd spring-boot:run`).
// Another server can be targeted with API_DOCS_URL.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const url = process.env.API_DOCS_URL ?? 'http://localhost:8080/v3/api-docs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join('src', 'api', 'generated', 'schema.ts');

try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
} catch (error) {
  console.error(`Cannot read ${url} (${error.message}). Is the backend running?`);
  process.exit(1);
}

// Yarn hoists the package to the repository root (nodeLinker: node-modules).
const cli = [path.join(root, 'node_modules'), path.join(root, '..', '..', 'node_modules')]
  .map((dir) => path.join(dir, 'openapi-typescript', 'bin', 'cli.js'))
  .find((file) => existsSync(file));
const result = spawnSync(
  process.execPath,
  [cli, url, '--root-types', '--root-types-no-schema-prefix', '-o', out],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
process.exit(result.status ?? 1);
