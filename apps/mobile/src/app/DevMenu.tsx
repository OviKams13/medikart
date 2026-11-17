import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Card, Chip } from '../components';
import { useTranslation } from '../i18n';
import { useTheme } from '../theme';
import { navigationRef } from './navigation';
import { sessionStatusChanged, useAppDispatch, useAppSelector, type SessionStatus } from './store';

const STATUSES: { status: SessionStatus; label: 'restoring' | 'signedOut' | 'signedIn' }[] = [
  { status: 'restoring', label: 'restoring' },
  { status: 'signedOut', label: 'signedOut' },
  { status: 'signedIn', label: 'signedIn' },
];

/**
 * Development menu (4.21): opens the component gallery and simulates the session state, so every
 * screen of the navigation tree can be reached before the real login exists (point 5).
 * Only rendered when `__DEV__` is true: never in a release build.
 */
export function DevMenu() {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.session.status);
  const [open, setOpen] = useState(false);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.corner,
        { top: insets.top + theme.spacing.sm, right: theme.spacing.sm, gap: theme.spacing.sm },
      ]}
    >
      <Chip label={t('dev.menu')} selected={open} onPress={() => setOpen(!open)} />
      {open && (
        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Button
              title={t('dev.gallery')}
              onPress={() => {
                setOpen(false);
                if (navigationRef.isReady()) navigationRef.navigate('DevGallery');
              }}
            />
            <AppText variant="label" color="textSecondary">
              {t('dev.session')}
            </AppText>
            {STATUSES.map(({ status, label }) => (
              <Chip
                key={status}
                label={t(`dev.${label}`)}
                selected={current === status}
                onPress={() => dispatch(sessionStatusChanged(status))}
              />
            ))}
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', alignItems: 'flex-end' },
});
