import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ClockState = {
  /** Server time minus phone time, in milliseconds. `null` until a response has been measured. */
  offsetMs: number | null;
};

const initialState: ClockState = { offsetMs: null };

/** Report §10.1 / D1.5-09: the server is authoritative for time. Measured again at every launch. */
export const clockSlice = createSlice({
  name: 'clock',
  initialState,
  reducers: {
    clockOffsetMeasured(state, action: PayloadAction<number>) {
      state.offsetMs = action.payload;
    },
  },
});

export const { clockOffsetMeasured } = clockSlice.actions;
