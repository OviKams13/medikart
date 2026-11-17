import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { ApiServicesProvider } from '../api';
import type { AppServices } from './services';

/** Redux (app state), React Query (server data) and the API services, for the whole app. */
export function AppProviders({
  services,
  children,
}: {
  services: AppServices;
  children: ReactNode;
}) {
  // React Query learns that the app is in the foreground from the app state (no browser focus here).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <ReduxProvider store={services.store}>
      <QueryClientProvider client={services.queryClient}>
        <ApiServicesProvider services={services}>{children}</ApiServicesProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
