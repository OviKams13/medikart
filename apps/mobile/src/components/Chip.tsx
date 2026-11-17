import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

/** Selectable pill (symptom filter, time slot, reminder choice). 44 pt high at least. */
export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
}: ChipProps) {
  const theme = useTheme();
  const background = selected ? theme.colors.primary : theme.colors.surfaceMuted;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.center,
        {
          minHeight: theme.sizes.chipHeight,
          minWidth: theme.sizes.minTouchTarget,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.pill,
          backgroundColor: disabled ? theme.colors.disabledBackground : background,
        },
      ]}
    >
      <AppText variant="label" color={selected ? 'onPrimary' : disabled ? 'textSecondary' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
