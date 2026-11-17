import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Typed access to the navigation from outside a screen (development menu, later: notifications). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
