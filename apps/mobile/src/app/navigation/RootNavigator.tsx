import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Loader, PlaceholderScreen } from '../../components';
import { useTranslation } from '../../i18n';
import { DevGallery } from '../DevGallery';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import type { RootStackParamList, SessionStatus } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function SplashScreen() {
  const { t } = useTranslation();
  // JS side of the splash. The native splash (no white flash) comes at 4.24.
  return (
    <PlaceholderScreen title={t('screens.splash')}>
      <Loader accessibilityLabel={t('common.loading')} />
    </PlaceholderScreen>
  );
}

export type RootNavigatorProps = {
  sessionStatus: SessionStatus;
  /** The component gallery is registered in development builds only. */
  showDevScreens?: boolean;
};

/**
 * Root stack (report §7.1). The screen shown depends only on the session state: Splash while the
 * session is restored, then Auth or App. Nothing navigates between Auth and App by hand: when the
 * state changes, the other group is registered and React Navigation moves to it.
 */
export function RootNavigator({ sessionStatus, showDevScreens = __DEV__ }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sessionStatus === 'restoring' && <Stack.Screen name="Splash" component={SplashScreen} />}
      {sessionStatus === 'signedOut' && <Stack.Screen name="Auth" component={AuthNavigator} />}
      {sessionStatus === 'signedIn' && <Stack.Screen name="App" component={AppNavigator} />}
      {showDevScreens && <Stack.Screen name="DevGallery" component={DevGallery} />}
    </Stack.Navigator>
  );
}
