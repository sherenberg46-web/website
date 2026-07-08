import { getOriginalPrice } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  price: number | null;
  discountPct?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ price, discountPct = 0, className, size = 'md' }: Props) {
  if (price == null) {
    return <span className={clsx('text-text-secondary', className)}>Цена по запросу</span>;
  }

  // Бесплатные игры (например, free-to-play): цена 0 — это «Бесплатно», а не «0 BYN»
  if (price === 0) {
    return (
      <span
        className={clsx(
          'font-bold text-accent',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-lg',
          size === 'lg' && 'text-3xl',
          className
        )}
      >
        Бесплатно
      </span>
    );
  }

  const originalPrice = discountPct > 0 ? getOriginalPrice(price, discountPct) : null;

  const priceClass = clsx(
    'font-bold text-text-primary',
    size === 'sm' && 'text-sm',
    size === 'md' && 'text-lg',
    size === 'lg' && 'text-3xl',
    className
  );

  return (
    <div className={clsx('flex items-baseline gap-2 flex-wrap', className)}>
      {originalPrice && (
        <span
          className={clsx(
            'line-through text-text-secondary',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-xl'
          )}
        >
          {originalPrice} BYN
        </span>
      )}
      <span className={priceClass}>{price} BYN</span>
      {discountPct > 0 && (
        <span className="text-xs font-bold text-black bg-accent rounded-full px-1.5 py-0.5">
          -{Math.round(discountPct)}%
        </span>
      )}
    </div>
  );
}
