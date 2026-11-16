import { Image, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { theme } from '../theme';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  getInitials,
  Loader,
  ScreenContainer,
  TextField,
} from './index';

async function render(element: ReactElement): Promise<ReactTestRenderer> {
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = create(element);
  });
  return tree;
}

const flat = (node: ReactTestInstance) => StyleSheet.flatten(node.props.style) ?? {};
const host = (tree: ReactTestRenderer, role: string) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === role)[0];
// The pressable element of a component (the one that has an `onPress` prop).
const press = (tree: ReactTestRenderer) =>
  tree.root.findAll((n) => typeof n.props.onPress === 'function')[0].props.onPress();
const allText = (tree: ReactTestRenderer) => JSON.stringify(tree.toJSON());

describe('AppText', () => {
  test('uses the theme font and color, and follows the phone font size', async () => {
    const tree = await render(<AppText variant="title">Hello</AppText>);
    const text = tree.root.findByType('Text' as never);
    expect(flat(text).fontFamily).toBe(theme.fontFamily.bold);
    expect(flat(text).color).toBe(theme.colors.text);
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.maxFontSizeMultiplier).toBe(theme.maxFontSizeMultiplier);
  });

  test('takes another theme color', async () => {
    const tree = await render(<AppText color="danger">Oops</AppText>);
    expect(flat(tree.root.findByType('Text' as never)).color).toBe(theme.colors.danger);
  });
});

describe('Button', () => {
  test('is a labelled button, calls onPress and is at least 44 pt high', async () => {
    const onPress = jest.fn();
    const tree = await render(<Button title="Book" onPress={onPress} />);
    const button = host(tree, 'button');
    expect(button.props.accessibilityLabel).toBe('Book');
    expect(flat(button).minHeight).toBeGreaterThanOrEqual(theme.sizes.minTouchTarget);
    expect(flat(button).backgroundColor).toBe(theme.colors.primary);
    act(() => press(tree));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('can have another accessibility label than its title', async () => {
    const tree = await render(
      <Button title="OK" accessibilityLabel="Confirm the booking" onPress={jest.fn()} />,
    );
    expect(host(tree, 'button').props.accessibilityLabel).toBe('Confirm the booking');
  });

  test('disabled: announced as disabled, grey', async () => {
    const tree = await render(<Button title="Book" disabled onPress={jest.fn()} />);
    const button = host(tree, 'button');
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    expect(flat(button).backgroundColor).toBe(theme.colors.disabledBackground);
  });

  test('loading: busy, disabled, shows a spinner and the translated label', async () => {
    const tree = await render(
      <Button title="Book" loading loadingAccessibilityLabel="Loading" onPress={jest.fn()} />,
    );
    const button = host(tree, 'button');
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    expect(button.props.accessibilityLabel).toBe('Loading');
    expect(tree.root.findAllByType('ActivityIndicator' as never).length).toBeGreaterThan(0);
  });

  test('danger and secondary variants use their theme colors', async () => {
    const danger = await render(<Button title="x" variant="danger" onPress={jest.fn()} />);
    expect(flat(host(danger, 'button')).backgroundColor).toBe(theme.colors.danger);
    const secondary = await render(<Button title="x" variant="secondary" onPress={jest.fn()} />);
    expect(flat(host(secondary, 'button')).backgroundColor).toBe(theme.colors.primarySoft);
  });
});

describe('TextField', () => {
  test('the input is labelled and forwards typing', async () => {
    const onChangeText = jest.fn();
    const tree = await render(<TextField label="Full name" onChangeText={onChangeText} />);
    const input = tree.root.findByType(RNTextInput);
    expect(input.props.accessibilityLabel).toBe('Full name');
    expect(flat(input).minHeight).toBeGreaterThanOrEqual(theme.sizes.minTouchTarget);
    expect(input.props.allowFontScaling).toBe(true);
    act(() => input.props.onChangeText('Jane'));
    expect(onChangeText).toHaveBeenCalledWith('Jane');
  });

  test('shows the error as an alert and colors the border', async () => {
    const tree = await render(<TextField label="Name" error="Required" />);
    expect(allText(tree)).toContain('Required');
    expect(host(tree, 'alert')).toBeDefined();
    expect(flat(tree.root.findByType(RNTextInput)).borderColor).toBe(theme.colors.danger);
  });

  test('without error: no alert, neutral border', async () => {
    const tree = await render(<TextField label="Name" />);
    expect(host(tree, 'alert')).toBeUndefined();
    expect(flat(tree.root.findByType(RNTextInput)).borderColor).toBe(theme.colors.borderStrong);
  });
});

describe('Card', () => {
  test('static card shows its content on a white surface with the theme radius', async () => {
    const tree = await render(
      <Card testID="card">
        <AppText>Inside</AppText>
      </Card>,
    );
    const card = tree.root.findAll(
      (n) => n.props.testID === 'card' && typeof n.type === 'string',
    )[0];
    expect(flat(card).borderRadius).toBe(theme.radius.lg);
    expect(flat(card).backgroundColor).toBe(theme.colors.surface);
    expect(allText(tree)).toContain('Inside');
  });

  test('pressable card is a labelled button', async () => {
    const onPress = jest.fn();
    const tree = await render(
      <Card onPress={onPress} accessibilityLabel="Open doctor">
        <AppText>Dr</AppText>
      </Card>,
    );
    expect(host(tree, 'button').props.accessibilityLabel).toBe('Open doctor');
    act(() => press(tree));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Avatar', () => {
  test('initials of first and last word', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
    expect(getInitials('  marie claire  dupont ')).toBe('MD');
    expect(getInitials('Madonna')).toBe('M');
    expect(getInitials('   ')).toBe('');
  });

  test('without photo: labelled initials in a circle', async () => {
    const tree = await render(
      <Avatar name="Jane Doe" accessibilityLabel="Photo of Jane" size="lg" />,
    );
    const circle = host(tree, 'image');
    expect(circle.props.accessibilityLabel).toBe('Photo of Jane');
    expect(flat(circle).width).toBe(theme.sizes.avatar.lg);
    expect(flat(circle).borderRadius).toBe(theme.radius.pill);
    expect(allText(tree)).toContain('JD');
  });

  test('with photo: an image with the label', async () => {
    const tree = await render(
      <Avatar name="Jane" uri="https://example.test/a.jpg" accessibilityLabel="Photo of Jane" />,
    );
    const image = tree.root.findByType(Image);
    expect(image.props.accessibilityLabel).toBe('Photo of Jane');
    expect(image.props.source).toEqual({ uri: 'https://example.test/a.jpg' });
  });
});

describe('Chip', () => {
  test('selected chip is announced as selected and uses the brand color', async () => {
    const tree = await render(<Chip label="Fever" selected onPress={jest.fn()} />);
    const chip = host(tree, 'button');
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
    expect(flat(chip).backgroundColor).toBe(theme.colors.primary);
    expect(flat(chip).minHeight).toBeGreaterThanOrEqual(theme.sizes.minTouchTarget);
  });

  test('unselected chip is grey and calls onPress', async () => {
    const onPress = jest.fn();
    const tree = await render(<Chip label="Cough" onPress={onPress} />);
    expect(flat(host(tree, 'button')).backgroundColor).toBe(theme.colors.surfaceMuted);
    act(() => press(tree));
    expect(onPress).toHaveBeenCalled();
  });

  test('disabled chip is announced as disabled', async () => {
    const tree = await render(<Chip label="10:00" disabled onPress={jest.fn()} />);
    expect(host(tree, 'button').props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('Loader', () => {
  test('is announced as a busy progress bar with its label', async () => {
    const tree = await render(<Loader accessibilityLabel="Loading content" />);
    const loader = host(tree, 'progressbar');
    expect(loader.props.accessibilityLabel).toBe('Loading content');
    expect(loader.props.accessibilityState).toMatchObject({ busy: true });
  });
});

describe('ScreenContainer', () => {
  test('renders its children, fixed or scrolling', async () => {
    const fixed = await render(
      <ScreenContainer>
        <AppText>Fixed content</AppText>
      </ScreenContainer>,
    );
    expect(allText(fixed)).toContain('Fixed content');
    const scrolling = await render(
      <ScreenContainer scroll>
        <AppText>Scrolling content</AppText>
      </ScreenContainer>,
    );
    expect(allText(scrolling)).toContain('Scrolling content');
  });
});
