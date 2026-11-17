import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppointmentsScreen } from '../../appointments';
import { HomeScreen } from '../../catalog';
import { useTranslation } from '../../i18n';
import { ProfileScreen, SettingsScreen } from '../../profile';
import { useTheme } from '../../theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const noIcon = () => null;

/** Home, Appointments, Settings, Profile (report EF-08). Icons come with the real screens. */
export function TabsNavigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium },
        tabBarIcon: noIcon,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('screens.home') }} />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: t('screens.appointments') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('screens.settings') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('screens.profile') }}
      />
    </Tab.Navigator>
  );
}
