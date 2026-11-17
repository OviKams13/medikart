import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Where the user is in the sign-in flow. Decides which root screen exists (report §7.1). */
export type SessionStatus = 'restoring' | 'signedOut' | 'signedIn';

export type SessionState = { status: SessionStatus };

// Point 5 (login) starts at `restoring`, reads the Firebase session, then sets one of the other
// two. Until then nobody is signed in. The Firebase session itself is kept by Firebase, not here.
const initialState: SessionState = { status: 'signedOut' };

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
