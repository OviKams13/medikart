import { useState } from 'react';
import { Linking, View } from 'react-native';
import { useAppConfig } from '../../api';
import { AppText, Button, ScreenContainer } from '../../components';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme';
import { resolveStoreUrl } from './storeLink';
import { INSTALLED_VERSION } from './version';

export type UpdateScreenProps = {
  /** The link to the store, or `null` while the app is not published. Default: the configured one. */
  storeUrl?: string | null;
  /** Default: the version installed. */
  installedVersion?: string;
};

/**
 * Blocking "Update" screen (report §7.1, EF-01): shown instead of every other screen while the
 * installed version is below `minimumVersion` of `/app-config`. No way to continue. The only
 * actions are opening the store (when a link exists) and checking again.
 */
export function UpdateScreen({
  storeUrl = resolveStoreUrl(),
  installedVersion = INSTALLED_VERSION,
}: UpdateScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const config = useAppConfig();
  const [opening, setOpening] = useState(false);
  const minimumVersion = config.data?.minimumVersion;
  const supportEmail = config.data?.support?.email;

  async function openStore() {
    if (!storeUrl || opening) return;
    setOpening(true);
    try {
      await Linking.openURL(storeUrl);
    } catch {
      // No store app to open the link: the user stays here and can try again.
    } finally {
      setOpening(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={{ gap: theme.spacing.lg, paddingTop: theme.spacing.xxxl }}>
        <AppText variant="title" accessibilityRole="header">
          {t('update.title')}
        </AppText>
        <AppText color="textSecondary">
          {storeUrl ? t('update.message') : t('update.messageNoLink')}
        </AppText>
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label" color="textSecondary">
            {`${t('update.installed')}: ${installedVersion}`}
          </AppText>
          {minimumVersion ? (
            <AppText variant="label" color="textSecondary">
              {`${t('update.required')}: ${minimumVersion}`}
            </AppText>
          ) : null}
        </View>
        {storeUrl ? (
          <Button title={t('update.store')} onPress={openStore} loading={opening} />
        ) : null}
        <Button
          title={t('update.checkAgain')}
          variant={storeUrl ? 'secondary' : 'primary'}
          onPress={() => {
            config.refetch();
          }}
          loading={config.isFetching}
          loadingAccessibilityLabel={t('common.loading')}
        />
        {supportEmail ? (
          <AppText variant="caption" color="textSecondary">
            {t('update.support', { email: supportEmail })}
          </AppText>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
