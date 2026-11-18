import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DevGallery } from '../DevGallery';
import { SplashScreen, UpdateScreen } from '../startup';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import type { RootStackParamList, SessionStatus } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// A named wrapper keeps the screen props out of UpdateScreen (it takes its own optional props).
function UpdateRoute() {
  return <UpdateScreen />;
}

export type RootNavigatorProps = {
  sessionStatus: SessionStatus;
  /** The installed version is below the server's minimum: only the Update screen exists (4.25). */
  updateRequired?: boolean;
  /** The component gallery is registered in development builds only. */
  showDevScreens?: boolean;
};

/**
 * Root stack (report §7.1). The screen shown depends only on the session state (Splash while the
 * session is restored, then Auth or App) and, above all, on the version check. Nothing navigates between Auth and App by hand: when the
 * state changes, the other group is registered and React Navigation moves to it.
 */
export function RootNavigator({
  sessionStatus,
  updateRequired = false,
  showDevScreens = __DEV__,
}: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {updateRequired ? (
        // Blocking: no other screen is registered, so nothing can navigate away from it.
        <Stack.Screen name="Update" component={UpdateRoute} />
      ) : (
        <>
          {sessionStatus === 'restoring' && <Stack.Screen name="Splash" component={SplashScreen} />}
          {sessionStatus === 'signedOut' && <Stack.Screen name="Auth" component={AuthNavigator} />}
          {sessionStatus === 'signedIn' && <Stack.Screen name="App" component={AppNavigator} />}
        </>
      )}
      {showDevScreens && <Stack.Screen name="DevGallery" component={DevGallery} />}
    </Stack.Navigator>
  );
}
