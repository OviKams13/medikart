import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import { AuthProvider, type AuthState } from '../auth';
import { initI18n } from '../i18n';
import { createRoutes } from './routes';

/** Everything the dashboard needs, in one place: language, auth state, router. */
export function App({ routes, initialAuth }: { routes?: RouteObject[]; initialAuth?: AuthState }) {
  const router = useMemo(() => createBrowserRouter(routes ?? createRoutes()), [routes]);
  return (
    <I18nextProvider i18n={initI18n()}>
      <AuthProvider initial={initialAuth}>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nextProvider>
  );
}
