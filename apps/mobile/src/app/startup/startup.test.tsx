import type { AxiosAdapter } from 'axios';
import fs from 'fs';
import path from 'path';
import { I18nextProvider } from 'react-i18next';
import { Linking } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { fakeAdapter, type FakeReply } from '../../api/testUtils';
import { changeLanguage, initI18n } from '../../i18n';
import { en } from '../../i18n/en';
import { fr } from '../../i18n/fr';
import { theme } from '../../theme';
import { AppProviders } from '../AppProviders';
import { AppShell } from '../AppShell';
import { createAppServices } from '../services';
import { APP_CONFIG_DEADLINE_MS, isBelowMinimum, parseVersion, resolveStoreUrl } from '.';
import { UpdateScreen } from './UpdateScreen';
import packageJson from '../../../package.json';

initI18n(); // the language reset in afterEach needs i18next ready, even in tests that render nothing

const mobileRoot = path.join(__dirname, '..', '..', '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(mobileRoot, ...parts), 'utf8');

describe('version comparison (4.25)', () => {
  test('parses X.Y.Z only', () => {
    expect(parseVersion('1.20.3')).toEqual([1, 20, 3]);
    expect(parseVersion(' 0.0.1 ')).toEqual([0, 0, 1]);
    for (const bad of ['1.0', '1.0.0.0', 'v1.0.0', '1.0.x', '', '1.0.0-beta']) {
      expect(parseVersion(bad)).toBeNull();
    }
  });

  test('blocks only when the installed version is strictly lower', () => {
    expect(isBelowMinimum('0.0.1', '0.0.2')).toBe(true);
    expect(isBelowMinimum('0.9.9', '1.0.0')).toBe(true);
    expect(isBelowMinimum('1.2.9', '1.3.0')).toBe(true);
    expect(isBelowMinimum('1.0.0', '1.0.0')).toBe(false);
    expect(isBelowMinimum('1.0.1', '1.0.0')).toBe(false);
    expect(isBelowMinimum('2.0.0', '1.99.99')).toBe(false);
  });

  test('compares numbers, not text (1.10.0 is above 1.9.0)', () => {
    expect(isBelowMinimum('1.10.0', '1.9.0')).toBe(false);
    expect(isBelowMinimum('1.9.0', '1.10.0')).toBe(true);
  });

  test('a missing or unreadable minimum never blocks', () => {
    for (const minimum of [null, undefined, '', 'abc', '1.0']) {
      expect(isBelowMinimum('0.0.1', minimum)).toBe(false);
    }
    expect(isBelowMinimum('not-a-version', '1.0.0')).toBe(false);
  });
});

describe('store link (4.25)', () => {
  test('no link configured yet: null', () => {
    expect(resolveStoreUrl('')).toBeNull();
    expect(resolveStoreUrl('   ')).toBeNull();
    expect(resolveStoreUrl()).toBeNull(); // the shipped configuration: Google Play is postponed
  });

  test('only https or market links are accepted', () => {
    expect(
      resolveStoreUrl('https://play.google.com/store/apps/details?id=com.medikart.patient'),
    ).toBe('https://play.google.com/store/apps/details?id=com.medikart.patient');
    expect(resolveStoreUrl('market://details?id=com.medikart.patient')).toBe(
      'market://details?id=com.medikart.patient',
    );
    expect(resolveStoreUrl('http://example.com')).toBeNull();
    expect(resolveStoreUrl('intent://details')).toBeNull();
  });
});

describe('native splash configuration (4.24)', () => {
  test('the app version is the package.json version, also used by Android', () => {
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(read('android', 'app', 'build.gradle')).toContain(
      'parse(file("../../package.json")).version',
    );
  });

  test('the launcher activity starts on the splash theme and initializes the splash', () => {
    expect(read('android', 'app', 'src', 'main', 'AndroidManifest.xml')).toContain(
      'android:theme="@style/BootTheme"',
    );
    const activity = read(
      'android',
      'app',
      'src',
      'main',
      'java',
      'com',
      'medikart',
      'patient',
      'MainActivity.kt',
    );
    expect(activity).toContain('RNBootSplash.init(this, R.style.BootTheme)');
    expect(activity).toContain('RNScreensFragmentFactory()');
  });

  test('splash background = theme primary color, so native and JavaScript splash match', () => {
    const colors = read('android', 'app', 'src', 'main', 'res', 'values', 'colors.xml');
    expect(colors.toLowerCase()).toContain(`>${theme.colors.primary.toLowerCase()}<`);
    const manifest = JSON.parse(read('assets', 'bootsplash', 'manifest.json'));
    expect(manifest.background.toLowerCase()).toBe(theme.colors.primary.toLowerCase());
  });

  test('splash logo size = theme size (same size in native and JavaScript)', () => {
    const manifest = JSON.parse(read('assets', 'bootsplash', 'manifest.json'));
    expect(manifest.logo).toEqual({
      width: theme.sizes.splashLogo,
      height: theme.sizes.splashLogo,
    });
    for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
      expect(
        fs.existsSync(
          path.join(
            mobileRoot,
            'android',
            'app',
            'src',
            'main',
            'res',
            `drawable-${density}`,
            'bootsplash_logo.png',
          ),
        ),
      ).toBe(true);
    }
    expect(fs.existsSync(path.join(mobileRoot, 'assets', 'brand', 'logo.svg'))).toBe(true);
  });
});

const REPLY = (minimumVersion: string, extra: object = {}): FakeReply => ({
  data: { minimumVersion, ...extra },
  headers: { date: 'Tue, 17 Nov 2026 10:00:30 GMT' },
});

let cleanup: (() => Promise<void>) | undefined;

async function renderApp(adapter: AxiosAdapter & { calls: unknown[] }) {
  const services = createAppServices({
    baseUrl: 'http://10.0.2.2:8080',
    adapter,
    queryRetryDelay: 0,
  });
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <I18nextProvider i18n={initI18n()}>
        <SafeAreaProvider>
          <AppProviders services={services}>
            <AppShell />
          </AppProviders>
        </SafeAreaProvider>
      </I18nextProvider>,
    );
  });
  cleanup = async () => {
    await act(async () => tree.unmount());
    services.queryClient.clear();
  };
  return { tree, services };
}

const text = (tree: ReactTestRenderer) => JSON.stringify(tree.toJSON());
const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 30)));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.mocked(BootSplash.hide).mockClear();
  await act(() => changeLanguage('fr'));
});

describe('startup sequence (4.24, 4.25)', () => {
  test('the splash is the first screen, then the app moves on; the native splash is hidden once', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const inner = fakeAdapter(REPLY('0.0.1'));
    const slow = Object.assign(
      (async (config) => {
        await gate;
        return inner(config);
      }) as AxiosAdapter,
      { calls: inner.calls },
    );
    const { tree, services } = await renderApp(slow);
    // Session still restoring: the JavaScript splash is on screen, with the native one hidden.
    expect(services.store.getState().session.status).toBe('restoring');
    expect(text(tree)).toContain(fr.screens.splash);
    expect(text(tree)).not.toContain(fr.screens.onboarding);
    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
    expect(BootSplash.hide).toHaveBeenCalledTimes(1);

    await act(async () => release());
    await settle();
    expect(services.store.getState().session.status).toBe('signedOut');
    expect(text(tree)).toContain(fr.screens.onboarding);
    expect(BootSplash.hide).toHaveBeenCalledTimes(1);
  });

  test('version too old: the Update screen replaces everything, in French', async () => {
    const { tree, services } = await renderApp(fakeAdapter(REPLY('9.0.0')));
    await settle();
    const output = text(tree);
    expect(output).toContain(fr.update.title);
    expect(output).toContain(`${fr.update.installed}: ${packageJson.version}`);
    expect(output).toContain(`${fr.update.required}: 9.0.0`);
    expect(output).not.toContain(fr.screens.onboarding);
    // Blocking: no store link yet, so the text says the update is not available, and no store button.
    expect(output).toContain(fr.update.messageNoLink);
    expect(output).not.toContain(fr.update.store);
    expect(services.store.getState().session.status).toBe('signedOut');
  });

  test('the Update screen also blocks a signed-in user', async () => {
    const { tree, services } = await renderApp(fakeAdapter(REPLY('9.0.0')));
    await settle();
    const { sessionStatusChanged } = require('../store');
    await act(async () => {
      services.store.dispatch(sessionStatusChanged('signedIn'));
    });
    expect(text(tree)).toContain(fr.update.title);
    expect(text(tree)).not.toContain(fr.screens.home);
  });

  test('the Update screen is translated in English', async () => {
    await act(() => changeLanguage('en'));
    const { tree } = await renderApp(fakeAdapter(REPLY('9.0.0')));
    await settle();
    expect(text(tree)).toContain(en.update.title);
  });

  test('the support email of /app-config is shown when it exists', async () => {
    const { tree } = await renderApp(
      fakeAdapter(REPLY('9.0.0', { support: { email: 'help@example.org' } })),
    );
    await settle();
    expect(text(tree)).toContain('Besoin d');
    expect(text(tree)).toContain('help@example.org');
  });

  test('equal or lower minimum version: no Update screen', async () => {
    const { tree } = await renderApp(fakeAdapter(REPLY(packageJson.version)));
    await settle();
    expect(text(tree)).toContain(fr.screens.onboarding);
    expect(text(tree)).not.toContain(fr.update.title);
  });

  test('server unreachable: the user is NOT blocked', async () => {
    const { tree, services } = await renderApp(fakeAdapter({ networkError: true }));
    await settle();
    expect(services.store.getState().session.status).toBe('signedOut');
    expect(text(tree)).toContain(fr.screens.onboarding);
    expect(text(tree)).not.toContain(fr.update.title);
  });

  test('server error (500) or unreadable minimum: the user is NOT blocked', async () => {
    for (const reply of [{ status: 500, data: {} }, REPLY('garbage')] as FakeReply[]) {
      const { tree } = await renderApp(fakeAdapter(reply));
      await settle();
      expect(text(tree)).toContain(fr.screens.onboarding);
      await cleanup?.();
      cleanup = undefined;
    }
  });

  test('server silent for too long: the app continues after the deadline', async () => {
    jest.useFakeTimers();
    const never = Object.assign((() => new Promise(() => undefined)) as AxiosAdapter, {
      calls: [] as unknown[],
    });
    const { tree, services } = await renderApp(never);
    expect(services.store.getState().session.status).toBe('restoring');
    expect(text(tree)).toContain(fr.screens.splash);
    await act(async () => {
      jest.advanceTimersByTime(APP_CONFIG_DEADLINE_MS + 10);
    });
    expect(services.store.getState().session.status).toBe('signedOut');
    expect(text(tree)).toContain(fr.screens.onboarding);
  });
});

describe('UpdateScreen (4.25)', () => {
  async function renderUpdate(
    props: { storeUrl: string | null },
    adapter = fakeAdapter(REPLY('9.0.0')),
  ) {
    const services = createAppServices({
      baseUrl: 'http://10.0.2.2:8080',
      adapter,
      queryRetryDelay: 0,
    });
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(
        <I18nextProvider i18n={initI18n()}>
          <SafeAreaProvider>
            <AppProviders services={services}>
              <UpdateScreen storeUrl={props.storeUrl} installedVersion="0.0.1" />
            </AppProviders>
          </SafeAreaProvider>
        </I18nextProvider>,
      );
    });
    cleanup = async () => {
      await act(async () => tree.unmount());
      services.queryClient.clear();
    };
    await settle();
    return { tree, adapter };
  }
  const press = async (tree: ReactTestRenderer, label: string) => {
    const target = tree.root.findAll(
      (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
    )[0];
    await act(async () => {
      target.props.onPress();
    });
  };

  test('with a store link: a button opens it', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    open.mockClear();
    const { tree } = await renderUpdate({
      storeUrl: 'https://play.google.com/store/apps/details?id=x',
    });
    expect(text(tree)).toContain(fr.update.message);
    await press(tree, fr.update.store);
    expect(open).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=x');
  });

  test('a store that cannot be opened does not crash the screen', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no store'));
    const { tree } = await renderUpdate({ storeUrl: 'market://details?id=x' });
    await press(tree, fr.update.store);
    expect(text(tree)).toContain(fr.update.title);
  });

  test('without a store link: no store button, explanation shown', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    open.mockClear();
    const { tree } = await renderUpdate({ storeUrl: null });
    expect(text(tree)).toContain(fr.update.messageNoLink);
    expect(text(tree)).not.toContain(fr.update.store);
    expect(open).not.toHaveBeenCalled();
  });

  test('"Check again" asks the server again', async () => {
    const { tree, adapter } = await renderUpdate({ storeUrl: null });
    const before = adapter.calls.length;
    await press(tree, fr.update.checkAgain);
    await settle();
    expect(adapter.calls.length).toBe(before + 1);
  });
});
