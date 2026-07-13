import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  variant?: 'accent' | 'blue' | 'outline' | 'preorder' | 'ps5' | 'ps4' | 'new';
  className?: string;
}

export function Badge({ children, variant = 'outline', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        variant === 'accent' && 'bg-accent/20 text-accent border border-accent/30',
        variant === 'blue' && 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
        variant === 'outline' && 'border border-border text-text-secondary',
        variant === 'preorder' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        variant === 'ps5' && 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
        variant === 'ps4' && 'bg-purple-600/20 text-purple-400 border border-purple-600/30',
        variant === 'new' && 'bg-accent/90 text-white border-0',
        className
      )}
    >
      {children}
    </span>
  );
}
