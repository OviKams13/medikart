import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useTheme } from '../theme';
import { DevMenu } from './DevMenu';
import { navigationRef, RootNavigator } from './navigation';
import { useAppSelector } from './store';

/** Navigation container + root navigator. The session state in the store chooses the screens. */
export function AppShell() {
  const theme = useTheme();
  const sessionStatus = useAppSelector((state) => state.session.status);
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
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator sessionStatus={sessionStatus} />
      {__DEV__ && <DevMenu />}
    </NavigationContainer>
  );
}
