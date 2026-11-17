import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

export type LoaderProps = {
  /** Screen reader text (translated by the caller), for example "Loading". */
  accessibilityLabel: string;
  /** Fills the available space and centers the spinner. Default: false (inline). */
  fill?: boolean;
  testID?: string;
};

/** Loading indicator in the brand color. */
export function Loader({ accessibilityLabel, fill = false, testID }: LoaderProps) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      style={[styles.center, { padding: theme.spacing.lg }, fill && styles.fill]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1 },
});
