import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Screen reader text. Default: the title. */
  accessibilityLabel?: string;
  /** Text shown to screen readers while `loading` (translated by the caller). */
  loadingAccessibilityLabel?: string;
  testID?: string;
};

/** Full-width button (corner radius and height from the mockups, minimum touch target 44 pt). */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  loadingAccessibilityLabel,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  const palette = {
    primary: {
      bg: theme.colors.primary,
      pressed: theme.colors.primaryPressed,
      fg: theme.colors.onPrimary,
    },
    secondary: {
      bg: theme.colors.primarySoft,
      pressed: theme.colors.disabledBackground,
      fg: theme.colors.primary,
    },
    danger: { bg: theme.colors.danger, pressed: theme.colors.danger, fg: theme.colors.onDanger },
  }[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={(loading && loadingAccessibilityLabel) || accessibilityLabel || title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: theme.sizes.buttonHeight,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.xl,
          backgroundColor: disabled
            ? theme.colors.disabledBackground
            : pressed
              ? palette.pressed
              : palette.bg,
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={palette.fg} style={{ marginEnd: theme.spacing.sm }} />
        ) : null}
        <AppText
          variant="button"
          style={{ color: disabled ? theme.colors.textSecondary : palette.fg }}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
