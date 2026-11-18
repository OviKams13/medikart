import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-pressed',
  secondary: 'bg-primary-soft text-primary hover:bg-surface-muted',
};

/** Basic button, colors from the theme. */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`min-h-11 cursor-pointer rounded-lg px-4 py-2 text-base font-semibold disabled:cursor-not-allowed disabled:bg-disabled-background disabled:text-text-disabled ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
