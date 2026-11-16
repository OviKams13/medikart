import { formatLongDay } from '@medikart/shared';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';
import { changeLanguage, initI18n, useErrorMessage, useLocale } from './index';
import { en } from './en';
import { fr } from './fr';

initI18n('fr');

function Probe() {
  const locale = useLocale();
  const message = useErrorMessage();
  return (
    <>
      <Text>{locale}</Text>
      {/* The language of the app is the one passed to the datetime module (4.20). */}
      <Text>
        {formatLongDay('2026-10-02T12:30:00Z', { locale, timeZone: 'Africa/Lubumbashi' })}
      </Text>
      <Text>{message('SLOT_TAKEN')}</Text>
      <Text>{message('SOME_CODE_FROM_A_NEWER_SERVER')}</Text>
      <Text>{message(undefined)}</Text>
    </>
  );
}

const texts = (tree: ReactTestRenderer) =>
  tree.root.findAllByType(Text).map((node) => node.props.children as string);

test('useLocale gives the current language to the datetime module and follows changes', async () => {
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = create(<Probe />);
  });
  const [localeFr, dateFr] = texts(tree);
  expect(localeFr).toBe('fr');
  expect(dateFr).toMatch(/octobre/);

  await act(() => changeLanguage('en'));
  const [localeEn, dateEn] = texts(tree);
  expect(localeEn).toBe('en');
  expect(dateEn).toMatch(/October/);
  await act(() => changeLanguage('fr'));
});

test('useErrorMessage translates the code, never the server message, with a safe fallback', async () => {
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = create(<Probe />);
  });
  const [, , known, unknown, missing] = texts(tree);
  expect(known).toBe(fr.errors.SLOT_TAKEN);
  expect(unknown).toBe(fr.errorsFallback.unknown);
  expect(missing).toBe(fr.errorsFallback.unknown);

  await act(() => changeLanguage('en'));
  expect(texts(tree)[2]).toBe(en.errors.SLOT_TAKEN);
  await act(() => changeLanguage('fr'));
});
