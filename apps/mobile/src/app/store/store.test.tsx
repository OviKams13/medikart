import { Provider } from 'react-redux';
import { act, create } from 'react-test-renderer';
import { clockOffsetMeasured, sessionStatusChanged } from '.';
import { useAppDispatch, useAppSelector } from './hooks';
import { createAppStore } from './store';

describe('store', () => {
  test('starts signed out with an unmeasured clock, and holds nothing else', () => {
    const state = createAppStore().getState();
    expect(state).toEqual({ session: { status: 'signedOut' }, clock: { offsetMs: null } });
  });

  test('session status changes', () => {
    const store = createAppStore();
    store.dispatch(sessionStatusChanged('signedIn'));
    expect(store.getState().session.status).toBe('signedIn');
    store.dispatch(sessionStatusChanged('restoring'));
    expect(store.getState().session.status).toBe('restoring');
  });

  test('clock offset is recorded, positive or negative, and replaced by the next measure', () => {
    const store = createAppStore();
    store.dispatch(clockOffsetMeasured(30_400));
    expect(store.getState().clock.offsetMs).toBe(30_400);
    store.dispatch(clockOffsetMeasured(-60_000));
    expect(store.getState().clock.offsetMs).toBe(-60_000);
  });

  test('every store is independent (no shared global state)', () => {
    const a = createAppStore();
    const b = createAppStore();
    a.dispatch(sessionStatusChanged('signedIn'));
    expect(b.getState().session.status).toBe('signedOut');
  });
});

describe('typed hooks', () => {
  test('useAppSelector reads the state and useAppDispatch updates it, re-rendering the reader', async () => {
    const store = createAppStore();
    const seen: string[] = [];
    let dispatch!: ReturnType<typeof useAppDispatch>;
    function Reader() {
      seen.push(useAppSelector((state) => state.session.status));
      dispatch = useAppDispatch();
      return null;
    }
    await act(async () => {
      create(
        <Provider store={store}>
          <Reader />
        </Provider>,
      );
    });
    await act(async () => {
      dispatch(sessionStatusChanged('signedIn'));
    });
    expect(seen).toEqual(['signedOut', 'signedIn']);
  });
});
