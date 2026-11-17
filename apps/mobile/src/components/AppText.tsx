import { Text, type TextProps } from 'react-native';
import { useTheme, type ColorName, type TextVariant } from '../theme';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

/** The only text component: font, size and color come from the theme; follows the phone font size. */
export function AppText({
  variant = 'body',
  color = 'text',
  align,
  style,
  maxFontSizeMultiplier,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? theme.maxFontSizeMultiplier}
      style={[
        theme.typography[variant],
        { color: theme.colors[color] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
