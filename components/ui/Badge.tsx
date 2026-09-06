import clsx from 'clsx';

type Variant = 'accent' | 'blue' | 'outline' | 'preorder' | 'ps5' | 'ps4' | 'new';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

/**
 * Единый бейдж. Форма-таблетка, размер 2xs, набор цветов сведён к
 * акцент / синий (платформа) / нейтральный. API и названия вариантов
 * прежние — визуально совпадает с предыдущей версией по габаритам.
 */
const VARIANTS: Record<Variant, string> = {
  accent: 'bg-accent/15 text-accent',
  new: 'bg-accent text-accent-contrast',
  preorder: 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/40',
  blue: 'bg-accent-blue/15 text-accent-blue',
  ps5: 'bg-accent-blue/15 text-accent-blue',
  ps4: 'bg-white/10 text-text-secondary',
  outline: 'text-text-secondary ring-1 ring-inset ring-border',
};

export function Badge({ children, variant = 'outline', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-2xs font-semibold leading-tight tracking-wide',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
