import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClient } from './client';
import type { Clock } from './clock';

export type ApiServices = {
  client: ApiClient;
  clock: Clock;
};

const ApiServicesContext = createContext<ApiServices | null>(null);

/** Gives the screens the single HTTP client and the single corrected clock of the app. */
export function ApiServicesProvider({
  services,
  children,
}: {
  services: ApiServices;
  children: ReactNode;
}) {
  return <ApiServicesContext.Provider value={services}>{children}</ApiServicesContext.Provider>;
}

function useServices(): ApiServices {
  const services = useContext(ApiServicesContext);
  if (!services) throw new Error('ApiServicesProvider is missing above this component.');
  return services;
}

/** The HTTP client. Features call it from their own API files, never `axios` directly. */
export function useApiClient(): ApiClient {
  return useServices().client;
}

/**
 * The corrected "now" (server time). Pass its result as the `now` of the datetime module:
 * `formatCountdown(start, { now: now() ... })`. Never read `Date.now()` for a business rule.
 */
export function useNow(): () => Date {
  return useServices().clock.now;
}
