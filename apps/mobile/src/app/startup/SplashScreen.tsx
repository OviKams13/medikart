import { Image, StatusBar, StyleSheet, View } from 'react-native';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme';

// Same image as the native splash (generated from `assets/brand/logo.svg` by `yarn generate:splash`),
// so the handover from native to JavaScript shows no change.
const logo = require('../../../assets/bootsplash/logo.png');

/**
 * JavaScript side of the splash (route `Splash`, session `restoring`). The native splash covers
 * the screen until the navigation is mounted, then `BootSplash.hide()` reveals this screen: same
 * background color and same centered logo, so there is no white flash and no jump.
 * Deliberately no safe-area padding: the native splash centers the logo in the whole window.
 */
export function SplashScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const size = theme.sizes.splashLogo;
  return (
    <View
      accessible
      accessibilityLabel={t('screens.splash')}
      style={[styles.fill, { backgroundColor: theme.colors.primary }]}
    >
      <StatusBar barStyle="light-content" />
      <Image
        source={logo}
        accessibilityIgnoresInvertColors
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
