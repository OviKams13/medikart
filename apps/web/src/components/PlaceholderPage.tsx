import type { ReactNode } from 'react';
import { useTranslation } from '../i18n';

/**
 * Temporary body of every page of the navigation tree (4.27): a translated title and a note.
 * Each real page replaces its placeholder in its own point; no business logic lives here.
 */
export function PlaceholderPage({ title, children }: { title: string; children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="text-text-secondary">{t('common.comingSoon')}</p>
      {children}
    </section>
  );
}
