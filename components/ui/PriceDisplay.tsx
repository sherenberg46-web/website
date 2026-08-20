import { getOriginalPrice } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  price: number | null;
  discountPct?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Цена в стиле Instant Gaming:
 * [-84%] [зачёркнутая старая] [крупная белая цена]
 */
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

  const hasDiscount = discountPct > 0;
  const originalPrice = hasDiscount ? getOriginalPrice(price, discountPct) : null;

  // Цена со скидкой — жёлтая и на ступень крупнее: выгода читается сразу,
  // ещё до того как глаз доберётся до бейджа с процентом.
  const priceClass = clsx(
    'font-extrabold tracking-tight',
    hasDiscount ? 'text-accent' : 'text-text-primary',
    size === 'sm' && (hasDiscount ? 'text-lg' : 'text-base'),
    size === 'md' && (hasDiscount ? 'text-2xl' : 'text-xl'),
    size === 'lg' && (hasDiscount ? 'text-5xl' : 'text-4xl')
  );

  return (
    <div className={clsx('flex items-center gap-2 flex-wrap', className)}>
      {discountPct > 0 && (
        <span
          className={clsx(
            'font-bold text-accent-contrast bg-accent rounded-md',
            size === 'sm' && 'text-[11px] px-1.5 py-0.5',
            size === 'md' && 'text-xs px-2 py-0.5',
            size === 'lg' && 'text-base px-2.5 py-1'
          )}
        >
          -{Math.round(discountPct)}%
        </span>
      )}
      {originalPrice && (
        <span
          className={clsx(
            'line-through text-text-secondary/70',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-xl'
          )}
        >
          {originalPrice}
        </span>
      )}
      <span className={priceClass}>{price} BYN</span>
    </div>
  );
}
