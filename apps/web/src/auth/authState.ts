import { createContext, useContext } from 'react';

/** Roles that use the dashboard (ERD `UserRole`; patients use the mobile app). */
export type DashboardRole = 'DOCTOR' | 'ADMIN';

/** Where the user stands. The routes depend only on this value (like the mobile session state). */
export type AuthState =
  { status: 'restoring' } | { status: 'signedOut' } | { status: 'signedIn'; role: DashboardRole };

export type AuthControls = {
  auth: AuthState;
  setAuth: (state: AuthState) => void;
};

export const AuthContext = createContext<AuthControls | null>(null);

function useAuthContext(): AuthControls {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}

/** The current auth state. */
export function useAuth(): AuthState {
  return useAuthContext().auth;
}

/**
 * Changes the auth state: for the login flow (point 5) and the dev page.
 * HOOK POINT FOR POINT 5: the Firebase email/password login (and `GET /users/me` for the role)
 * will call `setAuth` from here.
 */
export function useAuthControls(): { setAuth: (state: AuthState) => void } {
  return { setAuth: useAuthContext().setAuth };
}

/** Where a signed-in user lands: the first page of their area. */
export function homePathFor(role: DashboardRole): string {
  return role === 'ADMIN' ? '/admin/doctors' : '/agenda';
}
