import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { changeLanguage, initI18n } from '../../i18n';
import { en } from '../../i18n/en';
import { fr } from '../../i18n/fr';
import { navigationRef, RootNavigator, type SessionStatus } from '.';

function tree(status: SessionStatus, showDevScreens = false) {
  return (
    <I18nextProvider i18n={initI18n()}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator sessionStatus={status} showDevScreens={showDevScreens} />
      </NavigationContainer>
    </I18nextProvider>
  );
}

let mounted: ReactTestRenderer | undefined;

async function render(status: SessionStatus, showDevScreens = false) {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(tree(status, showDevScreens));
  });
  mounted = renderer;
  return renderer;
}

const text = (renderer: ReactTestRenderer) => JSON.stringify(renderer.toJSON());
const routeNames = () => navigationRef.getRootState()?.routes.map((route) => route.name);
const registeredNames = () => navigationRef.getRootState()?.routeNames;
const currentRoute = () => navigationRef.getCurrentRoute()?.name;

afterEach(async () => {
  await act(async () => mounted?.unmount());
  mounted = undefined;
  await act(() => changeLanguage('fr'));
});

describe('session state decides the screen (report §7.1)', () => {
  test('restoring: the splash only', async () => {
    const renderer = await render('restoring');
    expect(routeNames()).toEqual(['Splash']);
    expect(text(renderer)).toContain(fr.screens.splash);
  });

  test('signed out: the auth stack, starting at onboarding', async () => {
    const renderer = await render('signedOut');
    expect(routeNames()).toEqual(['Auth']);
    expect(currentRoute()).toBe('Onboarding');
    expect(text(renderer)).toContain(fr.screens.onboarding);
  });

  test('signed in: the app stack, starting at the Home tab with the four tabs', async () => {
    const renderer = await render('signedIn');
    expect(routeNames()).toEqual(['App']);
    expect(currentRoute()).toBe('Home');
    const output = text(renderer);
    for (const label of ['home', 'appointments', 'settings', 'profile'] as const) {
      expect(output).toContain(fr.screens[label]);
    }
  });

  test('changing the state swaps Auth for App with no manual navigation', async () => {
    const renderer = await render('signedOut');
    await act(async () => {
      renderer.update(tree('signedIn'));
    });
    expect(routeNames()).toEqual(['App']);
    expect(text(renderer)).not.toContain(fr.screens.onboarding);
    await act(async () => {
      renderer.update(tree('signedOut'));
    });
    expect(routeNames()).toEqual(['Auth']);
  });

  test('titles follow the language', async () => {
    await act(() => changeLanguage('en'));
    const renderer = await render('signedOut');
    expect(text(renderer)).toContain(en.screens.onboarding);
  });
});

describe('screens of the tree', () => {
  test('the auth stack goes Onboarding -> Login -> OTP -> Profile completion', async () => {
    const renderer = await render('signedOut');
    for (const [screen, key] of [
      ['Login', 'login'],
      ['OtpVerification', 'otp'],
      ['ProfileCompletion', 'profileCompletion'],
    ] as const) {
      await act(async () => {
        navigationRef.navigate('Auth', { screen });
      });
      expect(currentRoute()).toBe(screen);
      expect(text(renderer)).toContain(fr.screens[key]);
    }
  });

  test('screens above the tabs open with typed params and show their translated title', async () => {
    const renderer = await render('signedIn');
    const cases = [
      ['Search', undefined, 'search'],
      ['Doctors', { symptomId: 's1' }, 'doctors'],
      ['DoctorProfile', { doctorId: 'd1' }, 'doctorProfile'],
      ['BookingStep1', { doctorId: 'd1' }, 'booking1'],
      ['BookingStep2', { doctorId: 'd1' }, 'booking2'],
      ['AppointmentDetail', { appointmentId: 'a1' }, 'appointmentDetail'],
      ['Notifications', undefined, 'notifications'],
    ] as const;
    for (const [screen, params, key] of cases) {
      await act(async () => {
        navigationRef.navigate('App', { screen, params } as never);
      });
      expect(currentRoute()).toBe(screen);
      expect(text(renderer)).toContain(fr.screens[key]);
      await act(async () => {
        navigationRef.goBack();
      });
      expect(currentRoute()).toBe('Home');
    }
  });

  test('the voice call cannot be left by going back', async () => {
    await render('signedIn');
    await act(async () => {
      navigationRef.navigate('App', { screen: 'VoiceCall', params: { appointmentId: 'a1' } });
    });
    expect(currentRoute()).toBe('VoiceCall');
    await act(async () => {
      navigationRef.goBack();
    });
    expect(currentRoute()).toBe('VoiceCall');
  });
});

describe('development gallery', () => {
  test('registered in development builds only', async () => {
    await render('signedOut', true);
    expect(registeredNames()).toContain('DevGallery');
    await act(async () => {});
  });

  test('absent from the navigation tree otherwise', async () => {
    await render('signedOut', false);
    expect(registeredNames()).not.toContain('DevGallery');
  });
});

describe('typed routes', () => {
  test('wrong route names and params do not compile (checked by `yarn typecheck`)', () => {
    const neverCalled = () => {
      navigationRef.navigate('App', { screen: 'DoctorProfile', params: { doctorId: 'd1' } });
      // @ts-expect-error unknown route
      navigationRef.navigate('Nowhere');
      // @ts-expect-error the doctor identifier is required
      navigationRef.navigate('App', { screen: 'DoctorProfile', params: {} });
      // @ts-expect-error identifiers are strings
      navigationRef.navigate('App', { screen: 'AppointmentDetail', params: { appointmentId: 1 } });
    };
    expect(typeof neverCalled).toBe('function');
  });
});
