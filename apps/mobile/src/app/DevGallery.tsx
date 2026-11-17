import { formatTime } from '@medikart/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApiErrorMessage, useAppConfig, useNow } from '../api';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  Loader,
  ScreenContainer,
  TextField,
} from '../components';
import { changeLanguage, useErrorMessage, useLocale, useTranslation } from '../i18n';
import { useTheme, type ColorName } from '../theme';
import { useAppSelector } from './store';

// 4.16 proof kept on purpose: a runtime import of the datetime module of @medikart/shared.
const CHECK_INSTANT = '2026-10-02T12:30:00Z';
const SAMPLE_ERROR_CODE = 'SLOT_TAKEN';
const TYPE_SAMPLES = [
  ['display', 'sampleDisplay'],
  ['title', 'sampleTitle'],
  ['heading', 'sampleHeading'],
  ['body', 'sampleBody'],
  ['caption', 'sampleCaption'],
] as const;

/**
 * Development gallery (4.19): shows the theme and every base component so they can be checked
 * on a device. Since 4.21 it is a route of the root stack, registered in development builds only
 * and opened from the dev menu. Since 4.23 it also shows the `GET /app-config` result and the
 * measured clock offset.
 */
export function DevGallery() {
  const theme = useTheme();
  const { t } = useTranslation();
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  // 4.23: the chain client -> React Query -> screen, and the server clock, on a real call.
  const appConfig = useAppConfig();
  const apiErrorMessage = useApiErrorMessage();
  const now = useNow();
  const clockOffsetMs = useAppSelector((state) => state.clock.offsetMs);
  const [name, setName] = useState('');
  const [chip, setChip] = useState<'all' | 'one' | 'two'>('all');

  const section = (title: string) => (
    <AppText
      variant="heading"
      style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}
    >
      {title}
    </AppText>
  );
  const noop = () => undefined;

  return (
    <ScreenContainer scroll>
      <AppText variant="display">{t('common.appName')}</AppText>
      <AppText variant="title">{t('gallery.title')}</AppText>
      <AppText color="textSecondary">{t('gallery.subtitle')}</AppText>

      {section(t('gallery.sectionLanguage'))}
      <AppText>
        {t('gallery.languageLabel')}: {locale}
      </AppText>
      <View style={[styles.row, { gap: theme.spacing.sm, marginTop: theme.spacing.sm }]}>
        <Chip label="Français" selected={locale === 'fr'} onPress={() => changeLanguage('fr')} />
        <Chip label="English" selected={locale === 'en'} onPress={() => changeLanguage('en')} />
      </View>

      {section(t('gallery.sectionColors'))}
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        {(Object.keys(theme.colors) as ColorName[])
          .filter((color) => color !== 'transparent')
          .map((color) => (
            <View key={color} style={{ width: theme.sizes.avatar.xl }}>
              <View
                accessibilityElementsHidden
                style={{
                  height: theme.sizes.avatar.md,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors[color],
                  borderWidth: theme.sizes.borderWidth,
                  borderColor: theme.colors.divider,
                }}
              />
              <AppText variant="caption" color="textSecondary">
                {color}
              </AppText>
            </View>
          ))}
      </View>

      {section(t('gallery.sectionTypography'))}
      {TYPE_SAMPLES.map(([variant, key]) => (
        <AppText key={variant} variant={variant}>
          {t(`gallery.${key}`)}
        </AppText>
      ))}

      {section(t('gallery.sectionButtons'))}
      <View style={{ gap: theme.spacing.md }}>
        <Button title={t('gallery.buttonPrimary')} onPress={noop} />
        <Button title={t('gallery.buttonSecondary')} variant="secondary" onPress={noop} />
        <Button title={t('gallery.buttonDanger')} variant="danger" onPress={noop} />
        <Button title={t('gallery.buttonDisabled')} disabled onPress={noop} />
        <Button
          title={t('gallery.buttonLoading')}
          loading
          loadingAccessibilityLabel={t('common.loading')}
          onPress={noop}
        />
      </View>

      {section(t('gallery.sectionInputs'))}
      <View style={{ gap: theme.spacing.md }}>
        <TextField
          label={t('gallery.inputLabel')}
          placeholder={t('gallery.inputPlaceholder')}
          value={name}
          onChangeText={setName}
        />
        <TextField label={t('gallery.inputLabel')} error={t('gallery.inputError')} value="" />
      </View>

      {section(t('gallery.sectionCards'))}
      <Card>
        <View style={[styles.row, styles.centered, { gap: theme.spacing.md }]}>
          <Avatar name="Jane Doe" accessibilityLabel={t('gallery.avatarLabel')} size="lg" />
          <View style={styles.fill}>
            <AppText variant="bodyStrong">{t('gallery.cardTitle')}</AppText>
            <AppText variant="label" color="textSecondary">
              {t('gallery.cardText')}
            </AppText>
          </View>
        </View>
      </Card>

      {section(t('gallery.sectionChips'))}
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        <Chip
          label={t('gallery.chipAll')}
          selected={chip === 'all'}
          onPress={() => setChip('all')}
        />
        <Chip
          label={t('gallery.chipOne')}
          selected={chip === 'one'}
          onPress={() => setChip('one')}
        />
        <Chip
          label={t('gallery.chipTwo')}
          selected={chip === 'two'}
          onPress={() => setChip('two')}
        />
        <Chip label={t('gallery.buttonDisabled')} disabled onPress={noop} />
      </View>

      {section(t('gallery.sectionLoader'))}
      <Loader accessibilityLabel={t('gallery.loaderLabel')} />

      {section(t('gallery.sectionShared'))}
      <AppText variant="label" color="textSecondary">
        {t('gallery.timeLabel')}
      </AppText>
      <AppText>
        {CHECK_INSTANT} = {formatTime(CHECK_INSTANT, { locale, timeZone: 'Africa/Lubumbashi' })}
      </AppText>
      <AppText variant="label" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>
        {t('gallery.errorLabel')}
      </AppText>
      <AppText>
        {SAMPLE_ERROR_CODE}: {errorMessage(SAMPLE_ERROR_CODE)}
      </AppText>

      {section(t('gallery.sectionApi'))}
      <AppText variant="label" color="textSecondary">
        {t('gallery.apiConfigLabel')}
      </AppText>
      {appConfig.isPending && <Loader accessibilityLabel={t('common.loading')} />}
      {appConfig.isError && <AppText color="danger">{apiErrorMessage(appConfig.error)}</AppText>}
      {appConfig.data && (
        <AppText>
          {t('gallery.apiMinimumVersion')}: {appConfig.data.minimumVersion ?? t('gallery.notSet')}
        </AppText>
      )}
      <AppText>
        {t('gallery.apiClockOffset')}:{' '}
        {clockOffsetMs === null ? t('gallery.apiClockUnmeasured') : `${clockOffsetMs} ms`}
      </AppText>
      <AppText>
        {t('gallery.apiNow')}: {formatTime(now(), { locale })}
      </AppText>
      <View style={{ marginTop: theme.spacing.md }}>
        <Button
          title={t('gallery.apiRefresh')}
          variant="secondary"
          loading={appConfig.isFetching}
          loadingAccessibilityLabel={t('common.loading')}
          onPress={() => {
            appConfig.refetch();
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  fill: { flex: 1 },
  centered: { alignItems: 'center' },
});
