import { configureStore } from '@reduxjs/toolkit';
import { clockSlice } from './clockSlice';
import { sessionSlice } from './sessionSlice';

/**
 * The app state (Redux Toolkit, report §13 / D1.1-37): local state only. Server data lives in
 * React Query. Nothing is persisted yet: the report's persisted items (draft, recent searches,
 * preferences...) arrive with their features, and the clock offset is measured again each launch.
 */
export function createAppStore() {
  return configureStore({
    reducer: {
      session: sessionSlice.reducer,
      clock: clockSlice.reducer,
    },
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
