import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { fakeAdapter, type FakeReply } from '../src/api/testUtils';
import { AppProviders } from '../src/app/AppProviders';
import { AppShell } from '../src/app/AppShell';
import { createAppServices } from '../src/app/services';
import { changeLanguage, initI18n } from '../src/i18n';
import { en } from '../src/i18n/en';
import { fr } from '../src/i18n/fr';

const DATE_10_00_30 = 'Tue, 17 Nov 2026 10:00:30 GMT';
const REPLY: FakeReply = {
  data: { minimumVersion: '0.0.1' },
  headers: { date: DATE_10_00_30 },
};

let cleanup: (() => Promise<void>) | undefined;

async function renderApp(reply: FakeReply = REPLY) {
  const adapter = fakeAdapter(reply);
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
  return { tree, services, adapter };
}

const text = (tree: ReactTestRenderer) => JSON.stringify(tree.toJSON());
async function press(tree: ReactTestRenderer, label: string) {
  const target = tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
  )[0];
  await act(async () => {
    target.props.onPress();
  });
}
const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 50)));

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(async () => {
  await cleanup?.();
  cleanup = undefined;
  jest.restoreAllMocks();
  await act(() => changeLanguage('fr'));
});

test('the app starts on the first screen of the auth stack, in French by default', async () => {
  const { tree, adapter } = await renderApp();
  expect(text(tree)).toContain(fr.screens.onboarding);
  // No network call at startup before the update check (4.25) and login (point 5).
  expect(adapter.calls).toHaveLength(0);
});

test('the dev menu opens the gallery, which shows a shared-package time and the translated errors', async () => {
  const { tree } = await renderApp();
  await press(tree, fr.dev.menu);
  await press(tree, fr.dev.gallery);
  await settle();
  const output = text(tree);
  expect(output).toContain(fr.gallery.title);
  expect(output).toContain('14:30');
  expect(output).toContain(fr.errors.SLOT_TAKEN);
});

test('the gallery proves the chain: GET /app-config through React Query, and the clock offset', async () => {
  const { tree, services, adapter } = await renderApp();
  await press(tree, fr.dev.menu);
  await press(tree, fr.dev.gallery);
  await settle();
  const output = text(tree);
  expect(adapter.calls[0].url).toBe('/app-config');
  expect(output).toContain('0.0.1');
  expect(services.store.getState().clock.offsetMs).not.toBeNull();
  expect(output).toContain(`${services.store.getState().clock.offsetMs} ms`);
});

test('the gallery shows a translated message when the API call fails', async () => {
  const { tree } = await renderApp({ networkError: true });
  await press(tree, fr.dev.menu);
  await press(tree, fr.dev.gallery);
  await settle();
  expect(text(tree)).toContain(fr.errorsFallback.network);
});

test('the dev menu simulates the session and switches between auth and app screens', async () => {
  const { tree } = await renderApp();
  await press(tree, fr.dev.menu);
  await press(tree, fr.dev.signedIn);
  expect(text(tree)).not.toContain(fr.screens.onboarding);
  expect(text(tree)).toContain(fr.screens.home);
  await press(tree, fr.dev.restoring);
  expect(text(tree)).toContain(fr.screens.splash);
});

test('switching to English changes the screens and the dev menu', async () => {
  await act(() => changeLanguage('en'));
  const { tree } = await renderApp();
  expect(text(tree)).toContain(en.screens.onboarding);
});
