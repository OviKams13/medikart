import type { ReactNode } from 'react';
import { AppText } from './AppText';
import { ScreenContainer } from './ScreenContainer';

export type PlaceholderScreenProps = {
  /** Already translated title of the screen. */
  title: string;
  children?: ReactNode;
};

/**
 * Temporary body of every screen of the navigation tree (4.21): a translated title only.
 * Each business screen replaces its placeholder in its own point; no business logic lives here.
 */
export function PlaceholderScreen({ title, children }: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </ScreenContainer>
  );
}
