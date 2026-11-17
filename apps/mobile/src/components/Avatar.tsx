import { Image, StyleSheet, View } from 'react-native';
import { useTheme, type AvatarSize } from '../theme';
import { AppText } from './AppText';

export type AvatarProps = {
  /** Photo URL. Without it, the initials are shown. */
  uri?: string | null;
  /** Name used for the initials. */
  name: string;
  size?: AvatarSize;
  /** Screen reader text (translated by the caller), for example "Photo of Dr. X". */
  accessibilityLabel: string;
  testID?: string;
};

/** First letters of the first and last word, upper case. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/** Round photo or initials fallback. */
export function Avatar({ uri, name, size = 'md', accessibilityLabel, testID }: AvatarProps) {
  const theme = useTheme();
  const dimension = theme.sizes.avatar[size];
  const shape = { width: dimension, height: dimension, borderRadius: theme.radius.pill };
  if (uri) {
    return (
      <Image
        testID={testID}
        source={{ uri }}
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel={accessibilityLabel}
        style={[shape, { backgroundColor: theme.colors.primarySoft }]}
      />
    );
  }
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[shape, styles.center, { backgroundColor: theme.colors.primarySoft }]}
    >
      <AppText
        variant={size === 'sm' ? 'caption' : size === 'md' ? 'label' : 'heading'}
        color="primary"
        maxFontSizeMultiplier={1.2}
      >
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
