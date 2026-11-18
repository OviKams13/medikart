import { version as packageVersion } from '../../../package.json';

/**
 * Installed version of the app. Single source: "version" of `apps/mobile/package.json`; the Android
 * `versionName` is read from the same field (`android/app/build.gradle`), so both always agree.
 */
export const INSTALLED_VERSION: string = packageVersion;

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

/** `X.Y.Z` to three numbers, or `null` when it is not exactly that shape. */
export function parseVersion(value: string): [number, number, number] | null {
  const match = VERSION_PATTERN.exec(value.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * True only when both versions are readable `X.Y.Z` and the installed one is lower than the
 * minimum. A missing or unreadable minimum never blocks the user: a server mistake must not lock
 * every patient out of the app.
 */
export function isBelowMinimum(installed: string, minimum: string | null | undefined): boolean {
  if (!minimum) return false;
  const have = parseVersion(installed);
  const need = parseVersion(minimum);
  if (!have || !need) return false;
  for (let i = 0; i < 3; i += 1) {
    if (have[i] !== need[i]) return have[i] < need[i];
  }
  return false;
}
