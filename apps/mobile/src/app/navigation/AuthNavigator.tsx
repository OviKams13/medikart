import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  OnboardingScreen,
  OtpVerificationScreen,
  ProfileCompletionScreen,
} from '../../auth';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Onboarding -> Login -> OTP -> Profile completion (report §7.1). */
export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ProfileCompletion" component={ProfileCompletionScreen} />
    </Stack.Navigator>
  );
}
