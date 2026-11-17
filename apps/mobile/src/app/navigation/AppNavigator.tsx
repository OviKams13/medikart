import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentDetailScreen } from '../../appointments';
import { BookingStep1Screen, BookingStep2Screen } from '../../booking';
import { VoiceCallScreen } from '../../call';
import { DoctorProfileScreen, DoctorsScreen, SearchScreen } from '../../catalog';
import { NotificationsScreen } from '../../notifications';
import { TabsNavigator } from './TabsNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** The tabs and, on top of them, the screens opened from the tabs (report §7.1). */
export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Doctors" component={DoctorsScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="BookingStep1" component={BookingStep1Screen} />
      <Stack.Screen name="BookingStep2" component={BookingStep2Screen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      {/* Full screen, no back gesture (the screen also blocks the Android back button). */}
      <Stack.Screen
        name="VoiceCall"
        component={VoiceCallScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
