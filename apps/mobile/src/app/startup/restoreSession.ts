import type { SessionStatus } from '../store';

/**
 * Restores the user's session at launch and says where they stand.
 *
 * HOOK POINT FOR POINT 5 (login): replace this body with the Firebase session restore (read the
 * current Firebase user, then `signedIn` or `signedOut`). Until login exists, nobody is signed in.
 */
export async function restoreSession(): Promise<Exclude<SessionStatus, 'restoring'>> {
  return 'signedOut';
}
