import { Navigate, Outlet } from 'react-router';
import { useTranslation } from '../i18n';
import { homePathFor, useAuth, type DashboardRole } from './authState';

function Restoring() {
  const { t } = useTranslation();
  return <p className="p-6 text-text-secondary">{t('common.loading')}</p>;
}

/**
 * Routes that need a session and a given role. Signed out goes to the login page; the wrong role
 * goes back to its own area. The server checks the role again on every request (report §15).
 */
export function RequireRole({ role }: { role: DashboardRole }) {
  const auth = useAuth();
  if (auth.status === 'restoring') return <Restoring />;
  if (auth.status === 'signedOut') return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to={homePathFor(auth.role)} replace />;
  return <Outlet />;
}

/** `/`: sends everyone to the right place. */
export function HomeRedirect() {
  const auth = useAuth();
  if (auth.status === 'restoring') return <Restoring />;
  if (auth.status === 'signedOut') return <Navigate to="/login" replace />;
  return <Navigate to={homePathFor(auth.role)} replace />;
}
