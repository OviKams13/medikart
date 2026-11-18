import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Where the user is in the sign-in flow. Decides which root screen exists (report §7.1). */
export type SessionStatus = 'restoring' | 'signedOut' | 'signedIn';

export type SessionState = { status: SessionStatus };

// Every launch starts at `restoring` (the splash). `useStartup` (app/startup) leaves it once the
// session is restored and the version checked; point 5 (login) supplies the real Firebase restore.
// The Firebase session itself is kept by Firebase, not here.
const initialState: SessionState = { status: 'restoring' };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStatusChanged(state, action: PayloadAction<SessionStatus>) {
      state.status = action.payload;
    },
  },
});

export const { sessionStatusChanged } = sessionSlice.actions;
