import { useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState } from './authState';

/**
 * Holds the auth state. Until login exists (point 5) nobody is signed in; the dev page can
 * simulate a doctor or an administrator (development builds only).
 */
export function AuthProvider({
  initial = { status: 'signedOut' },
  children,
}: {
  initial?: AuthState;
  children: ReactNode;
}) {
  const [auth, setAuth] = useState<AuthState>(initial);
  const value = useMemo(() => ({ auth, setAuth }), [auth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
