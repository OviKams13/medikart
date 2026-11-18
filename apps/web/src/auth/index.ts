/**
 * Authentication of the dashboard. 4.27: the state and the route guards only; the Firebase email
 * and password login is point 5.
 */
export { AuthProvider } from './AuthProvider';
export {
  homePathFor,
  useAuth,
  useAuthControls,
  type AuthState,
  type DashboardRole,
} from './authState';
export { HomeRedirect, RequireRole } from './guards';
