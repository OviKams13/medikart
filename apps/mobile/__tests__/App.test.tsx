import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import App from '../src/app/App';
import { en } from '../src/i18n/en';
import { fr } from '../src/i18n/fr';
import { changeLanguage } from '../src/i18n';

async function renderApp() {
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = create(<App />);
  });
  return JSON.stringify(tree.toJSON());
}

afterEach(async () => {
  await act(() => changeLanguage('fr'));
});

test('development gallery renders and shows a time formatted by @medikart/shared', async () => {
  expect(await renderApp()).toContain('14:30');
});

test('the gallery follows the current language, French by default (phone language unknown)', async () => {
  const text = await renderApp();
  expect(text).toContain(fr.gallery.title);
  expect(text).toContain(fr.errors.SLOT_TAKEN);
});

test('switching to English changes the texts, including translated API errors', async () => {
  await act(() => changeLanguage('en'));
  const text = await renderApp();
  expect(text).toContain(en.gallery.title);
  expect(text).toContain(en.errors.SLOT_TAKEN);
});
