import type { ReactNode } from 'react';
import { Pressable, View, type AccessibilityRole } from 'react-native';
import { useTheme } from '../theme';

export type CardProps = {
  children: ReactNode;
  /** Makes the whole card a button. `accessibilityLabel` is then required. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
};

/** White rounded surface with a soft elevation (doctor cards, summary blocks). */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityRole,
  testID,
}: CardProps) {
  const theme = useTheme();
  const surface = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    elevation: theme.elevation.card,
    borderWidth: theme.sizes.borderWidth,
    borderColor: theme.colors.divider,
  };
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        style={[surface, { minHeight: theme.sizes.minTouchTarget }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      testID={testID}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
      style={surface}
    >
      {children}
    </View>
  );
}
