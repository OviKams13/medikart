import { StyleSheet, TextInput as RNTextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  /** Visible label, also the accessibility label. */
  label: string;
  /** Error message (already translated). Shown under the field. */
  error?: string;
};

/** Labelled text input: thin border (3:1 contrast), corner radius from the mockups, error line. */
export function TextField({ label, error, editable = true, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const borderColor = error ? theme.colors.danger : theme.colors.borderStrong;
  return (
    <View>
      <AppText variant="label" style={{ marginBottom: theme.spacing.xs }}>
        {label}
      </AppText>
      <RNTextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        editable={editable}
        allowFontScaling
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          theme.typography.body,
          styles.input,
          {
            minHeight: theme.sizes.inputHeight,
            borderRadius: theme.radius.md,
            borderWidth: theme.sizes.borderWidth,
            borderColor,
            paddingHorizontal: theme.spacing.lg,
            color: theme.colors.text,
            backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
          },
        ]}
        {...rest}
      />
      {error ? (
        <AppText
          variant="caption"
          color="danger"
          accessibilityRole="alert"
          style={{ marginTop: theme.spacing.xs }}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { includeFontPadding: false },
});
