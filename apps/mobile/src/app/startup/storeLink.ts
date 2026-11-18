/**
 * Where the "Update" screen sends the user. Per-build configuration, not a secret.
 *
 * The app is not on Google Play yet (3.12 postponed: it needs an organization account). Until it
 * is, leave this empty: the Update screen then explains that the update is not available yet.
 * Once published, put the listing link here, for example
 * `https://play.google.com/store/apps/details?id=com.medikart.patient`.
 */
export const PLAY_STORE_URL = '';

/** The store link, or `null` while none is configured (empty or not an https/market link). */
export function resolveStoreUrl(url: string = PLAY_STORE_URL): string | null {
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('market://')) return trimmed;
  return null;
}
