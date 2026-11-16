import type { ReactNode } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

export type ScreenContainerProps = {
  children: ReactNode;
  /** Scrolls the content (forms, long lists of blocks). Default: a fixed view. */
  scroll?: boolean;
  /** Horizontal padding. Default: true. */
  padded?: boolean;
  style?: ViewStyle;
};

/** Base of every screen: safe area, background, status bar and page margins from the theme. */
export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  style,
}: ScreenContainerProps) {
  const theme = useTheme();
  const padding = padded ? { paddingHorizontal: theme.spacing.lg } : undefined;
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingVertical: theme.spacing.lg }, padding, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, { paddingVertical: theme.spacing.lg }, padding, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
