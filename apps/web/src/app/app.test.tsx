import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider, type AuthState } from '../auth';
import { changeLanguage, initI18n } from '../i18n';
import { en } from '../i18n/en';
import { fr } from '../i18n/fr';
import { createRoutes } from './routes';

const DOCTOR: AuthState = { status: 'signedIn', role: 'DOCTOR' };
const ADMIN: AuthState = { status: 'signedIn', role: 'ADMIN' };
const SIGNED_OUT: AuthState = { status: 'signedOut' };

function renderAt(path: string, auth: AuthState, options: { showDevPage?: boolean } = {}) {
  const router = createMemoryRouter(createRoutes({ showDevPage: false, ...options }), {
    initialEntries: [path],
  });
  render(
    <I18nextProvider i18n={initI18n('fr')}>
      <AuthProvider initial={auth}>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nextProvider>,
  );
  return router;
}

const stubAppConfig = (reply: () => Response | Promise<Response>) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => reply()),
  );

beforeEach(() => {
  // No test may reach a real server.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new TypeError('network');
    }),
  );
});

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  await changeLanguage('fr');
});

describe('navigation by role (report §7.2)', () => {
  test('signed out: every protected route goes to the login page', async () => {
    for (const path of ['/', '/agenda', '/schedules', '/admin/doctors', '/call/abc']) {
      const router = renderAt(path, SIGNED_OUT);
      await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
      expect(screen.getByRole('heading', { name: fr.pages.login })).toBeTruthy();
      cleanup();
    }
  });

  test('a doctor lands on the agenda and sees the doctor area only', async () => {
    const router = renderAt('/', DOCTOR);
    await waitFor(() => expect(router.state.location.pathname).toBe('/agenda'));
    expect(screen.getByRole('heading', { name: fr.pages.agenda })).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: fr.nav.main });
    for (const label of [fr.nav.agenda, fr.nav.schedules, fr.nav.leave, fr.nav.profile]) {
      expect(nav.textContent).toContain(label);
    }
    expect(nav.textContent).toContain(fr.nav.doctorArea);
    expect(nav.textContent).not.toContain(fr.nav.administration);
    expect(nav.textContent).not.toContain(fr.nav.clinics);
  });

  test('every doctor page exists', async () => {
    const pages: [string, string][] = [
      ['/agenda', fr.pages.agenda],
      ['/agenda/appointments/66f0', fr.pages.appointmentDetail],
      ['/schedules', fr.pages.schedules],
      ['/leave', fr.pages.leave],
      ['/profile', fr.pages.profile],
      ['/incoming-call', fr.pages.incomingCall],
      ['/call/66f0', fr.pages.callScreen],
    ];
    for (const [path, title] of pages) {
      renderAt(path, DOCTOR);
      expect(await screen.findByRole('heading', { name: title })).toBeTruthy();
      cleanup();
    }
  });

  test('a doctor cannot open the administration: back to the agenda', async () => {
    const router = renderAt('/admin/doctors', DOCTOR);
    await waitFor(() => expect(router.state.location.pathname).toBe('/agenda'));
  });

  test('an administrator lands on the doctor list and sees the Administration section only', async () => {
    const router = renderAt('/', ADMIN);
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/doctors'));
    const nav = screen.getByRole('navigation', { name: fr.nav.main });
    expect(nav.textContent).toContain(fr.nav.administration);
    expect(nav.textContent).toContain(fr.nav.doctors);
    expect(nav.textContent).toContain(fr.nav.clinics);
    expect(nav.textContent).not.toContain(fr.nav.agenda);
  });

  test('every administration page exists, and a doctor page sends an admin back', async () => {
    const pages: [string, string][] = [
      ['/admin/doctors', fr.pages.doctors],
      ['/admin/doctors/new', fr.pages.newDoctor],
      ['/admin/doctors/66f0', fr.pages.editDoctor],
      ['/admin/clinics', fr.pages.clinics],
    ];
    for (const [path, title] of pages) {
      renderAt(path, ADMIN);
      expect(await screen.findByRole('heading', { name: title })).toBeTruthy();
      cleanup();
    }
    const router = renderAt('/agenda', ADMIN);
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/doctors'));
  });

  test('the public pages need no session', async () => {
    renderAt('/supprimer-mon-compte', SIGNED_OUT);
    expect(await screen.findByRole('heading', { name: fr.pages.deleteAccount })).toBeTruthy();
    cleanup();
    renderAt('/forgot-password', SIGNED_OUT);
    expect(await screen.findByRole('heading', { name: fr.pages.forgotPassword })).toBeTruthy();
  });

  test('unknown address: page not found', async () => {
    renderAt('/nope', DOCTOR);
    expect(await screen.findByRole('heading', { name: fr.pages.notFound })).toBeTruthy();
  });

  test('the session restoring state shows a loading text, not a page', async () => {
    renderAt('/agenda', { status: 'restoring' });
    expect(await screen.findByText(fr.common.loading)).toBeTruthy();
  });

  test('signing out returns to the login page', async () => {
    const router = renderAt('/agenda', DOCTOR);
    fireEvent.click(await screen.findByRole('button', { name: fr.nav.signOut }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
  });

  test('the dev page exists only when asked (development builds)', async () => {
    renderAt('/dev', SIGNED_OUT);
    expect(await screen.findByRole('heading', { name: fr.pages.notFound })).toBeTruthy();
    cleanup();
    stubAppConfig(() => Response.json({ minimumVersion: '0.0.1' }));
    renderAt('/dev', SIGNED_OUT, { showDevPage: true });
    expect(await screen.findByRole('heading', { name: fr.dev.title })).toBeTruthy();
  });
});

describe('language (4.27)', () => {
  test('French by default, English on request, with the page title translated', async () => {
    renderAt('/login', SIGNED_OUT);
    expect(await screen.findByRole('heading', { name: fr.pages.login })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(fr.language.label), { target: { value: 'en' } });
    expect(await screen.findByRole('heading', { name: en.pages.login })).toBeTruthy();
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('dev page: shared package and /app-config (4.27)', () => {
  test('shows the shared datetime module, the version from /app-config and a translated error', async () => {
    stubAppConfig(() => Response.json({ minimumVersion: '0.0.1' }));
    renderAt('/dev', SIGNED_OUT, { showDevPage: true });
    // 12:30 UTC = 14:30 in Lubumbashi, computed by @medikart/shared whatever the computer's timezone.
    expect((await screen.findByTestId('shared-time')).textContent).toBe('14:30');
    expect((await screen.findByTestId('minimum-version')).textContent).toBe('0.0.1');
    expect(screen.getByText(fr.errors.SLOT_TAKEN)).toBeTruthy();
  });

  test('a failing server shows the translated network message', async () => {
    renderAt('/dev', SIGNED_OUT, { showDevPage: true });
    expect((await screen.findByRole('alert')).textContent).toBe(fr.errorsFallback.network);
  });

  test('an API error shows the translation of its code, never the server text', async () => {
    stubAppConfig(() =>
      Response.json(
        { code: 'RATE_LIMITED', message: 'SERVER ENGLISH TEXT', details: [], traceId: 'x' },
        { status: 429 },
      ),
    );
    renderAt('/dev', SIGNED_OUT, { showDevPage: true });
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(fr.errors.RATE_LIMITED);
    expect(document.body.textContent).not.toContain('SERVER ENGLISH TEXT');
  });

  test('the dev page simulates the session, and the simulated role opens its area', async () => {
    stubAppConfig(() => Response.json({}));
    const router = renderAt('/dev', SIGNED_OUT, { showDevPage: true });
    expect(screen.getByTestId('auth-state').textContent).toBe('signedOut');
    fireEvent.click(screen.getByRole('button', { name: fr.dev.admin }));
    expect(screen.getByTestId('auth-state').textContent).toBe('ADMIN');
    await router.navigate('/');
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/doctors'));
  });
});
