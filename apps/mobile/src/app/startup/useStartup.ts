import { useEffect, useRef, useState } from 'react';
import { useAppConfig } from '../../api';
import { sessionStatusChanged, useAppDispatch, useAppSelector, type SessionStatus } from '../store';
import { restoreSession } from './restoreSession';
import { INSTALLED_VERSION, isBelowMinimum } from './version';

/**
 * How long the splash waits for `/app-config`. Past this, the app continues without the answer
 * (the report does not say to block when the server cannot be reached): a patient with a bad
 * network is not stuck on the splash. The request keeps going, and if it later says the version
 * is too old, the Update screen takes over.
 */
export const APP_CONFIG_DEADLINE_MS = 4000;

export type Startup = {
  /** The installed version is below `minimumVersion`: the Update screen replaces everything. */
  updateRequired: boolean;
};

/**
 * Startup sequence (report EF-01): during the splash the app checks the minimum version and
 * restores the session. When both are done, the session leaves `restoring` and the root navigator
 * shows the first real screen. The handover happens once per launch.
 */
export function useStartup(installedVersion: string = INSTALLED_VERSION): Startup {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.session.status);
  const config = useAppConfig();
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [restored, setRestored] = useState<Exclude<SessionStatus, 'restoring'> | null>(null);
  const handedOver = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDeadlinePassed(true), APP_CONFIG_DEADLINE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    restoreSession().then((result) => {
      if (active) setRestored(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const configSettled = config.isSuccess || config.isError || deadlinePassed;

  useEffect(() => {
    if (handedOver.current || !configSettled || restored === null) return;
    handedOver.current = true;
    // Only leaves `restoring`: another status (set by the dev menu, or later by login) is kept.
    if (status === 'restoring') dispatch(sessionStatusChanged(restored));
  }, [configSettled, restored, status, dispatch]);

  return {
    updateRequired:
      config.isSuccess && isBelowMinimum(installedVersion, config.data.minimumVersion),
  };
}
