import { NavLink, Outlet } from 'react-router';
import { useAuth, useAuthControls, type DashboardRole } from '../auth';
import { useTranslation } from '../i18n';
import { Button } from './Button';
import { LanguageSwitch } from './LanguageSwitch';

type NavKey = 'agenda' | 'schedules' | 'leave' | 'profile' | 'doctors' | 'clinics';

type NavItem = { to: string; label: NavKey };

// One list per role: a doctor sees the doctor area, the administrator sees the Administration
// section (report §3 and §7.2).
const NAVIGATION: Record<
  DashboardRole,
  { section: 'doctorArea' | 'administration'; items: NavItem[] }
> = {
  DOCTOR: {
    section: 'doctorArea',
    items: [
      { to: '/agenda', label: 'agenda' },
      { to: '/schedules', label: 'schedules' },
      { to: '/leave', label: 'leave' },
      { to: '/profile', label: 'profile' },
    ],
  },
  ADMIN: {
    section: 'administration',
    items: [
      { to: '/admin/doctors', label: 'doctors' },
      { to: '/admin/clinics', label: 'clinics' },
    ],
  },
};

/** Frame of the signed-in pages: side navigation by role, language, sign out. */
export function DashboardLayout() {
  const auth = useAuth();
  const { setAuth } = useAuthControls();
  const { t } = useTranslation();
  if (auth.status !== 'signedIn') return null;
  const { section, items } = NAVIGATION[auth.role];

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-divider bg-surface p-4">
        <p className="text-xl font-bold text-primary">{t('common.appName')}</p>
        <nav aria-label={t('nav.main')} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-semibold uppercase text-text-secondary">
            {t(`nav.${section}`)}
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-lg px-3 text-base font-medium ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-text hover:bg-surface-muted'
                }`
              }
            >
              {t(`nav.${item.label}`)}
            </NavLink>
          ))}
          {import.meta.env.DEV && (
            <NavLink
              to="/dev"
              className="flex min-h-11 items-center rounded-lg px-3 text-base text-text-secondary hover:bg-surface-muted"
            >
              {t('nav.dev')}
            </NavLink>
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <LanguageSwitch />
          <Button variant="secondary" onClick={() => setAuth({ status: 'signedOut' })}>
            {t('nav.signOut')}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
