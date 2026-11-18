import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import { useTheme } from '../theme';
import { DevMenu } from './DevMenu';
import { navigationRef, RootNavigator } from './navigation';
import { useAppSelector } from './store';
import { useStartup } from './startup';

/** Navigation container + root navigator. The session state in the store chooses the screens. */
export function AppShell() {
  const theme = useTheme();
  const sessionStatus = useAppSelector((state) => state.session.status);
  const { updateRequired } = useStartup();
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.divider,
    },
  };
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      // The JavaScript splash is on screen: the native one can go (fade, no white flash, 4.24).
      onReady={() => {
        BootSplash.hide({ fade: true });
      }}
    >
      <RootNavigator sessionStatus={sessionStatus} updateRequired={updateRequired} />
      {__DEV__ && <DevMenu />}
    </NavigationContainer>
  );
}
