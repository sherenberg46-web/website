'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { REGIONS, getClientRegion, type Region } from '@/lib/region';
import { RegionBadge } from '@/components/ui/RegionBadge';
import Image from 'next/image';
import { SUB_PRICES, EA_IDS, monthsLabel } from '@/lib/subscriptions';

const EA_PERIODS: (1 | 12)[] = [1, 12];

/**
 * Покупка EA Play — тот же поток, что в PricingTable на странице /subscriptions:
 * те же EA_IDS, те же цены SUB_PRICES, та же корзина.
 */
export function EaPlayPurchase() {
  const addItem = useCartStore((s) => s.addItem);
  const [region, setRegion] = useState<Region>('UA');
  const [added, setAdded] = useState<string | null>(null);

  // Стартуем с региона из шапки
  useEffect(() => {
    setRegion(getClientRegion());
  }, []);

  function buyEa(m: 1 | 12) {
    const key = `ea-${region}-${m}`;
    addItem({
      product_id: EA_IDS[region][m],
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `EA Play — ${monthsLabel(m)} (${region})`,
      image_url: '/images/ea-play.jpg',
      price_byn: SUB_PRICES[region].eaplay[m],
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <div>
      {/* Region tabs — как в таблице цен подписок */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 bg-bg-card border border-border rounded-full p-1">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                region === r.value
                  ? 'bg-brand-gradient text-accent-contrast'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <RegionBadge code={r.value} />
                {r.value === 'UA' ? 'Украина' : 'Турция'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {EA_PERIODS.map((m) => {
          const price = SUB_PRICES[region].eaplay[m];
          const perMonth = Math.round(price / m);
          const key = `ea-${region}-${m}`;
          const highlighted = m === 12;
          return (
            <div
              key={m}
              className={clsx(
                'relative bg-bg-card border rounded-2xl overflow-hidden flex flex-col transition-colors',
                highlighted ? 'border-accent/60' : 'border-border hover:border-border-strong'
              )}
            >
              {highlighted && (
                <span className="absolute top-3 right-3 z-10 bg-accent text-accent-contrast text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Выгоднее
                </span>
              )}
              {/* Широкая 16:9-версия обложки — заполняет рамку целиком */}
              <div className="relative aspect-[16/9]">
                <Image
                  src="/images/ea-play-wide.jpg"
                  alt="EA Play"
                  fill
                  sizes="(max-width: 640px) 90vw, 340px"
                  className="object-cover"
                />
              </div>
              <div className="p-6 pt-4 flex flex-col flex-1">
              <div className="text-sm font-semibold text-text-secondary">{monthsLabel(m)}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight">{price}</span>
                <span className="text-text-secondary text-sm font-semibold">BYN</span>
              </div>
              <div className="text-xs text-text-muted mt-1">
                ≈ {perMonth} BYN / мес
              </div>
              <button
                onClick={() => buyEa(m)}
                className={clsx(
                  'mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-colors',
                  added === key
                    ? 'bg-accent/20 text-accent'
                    : 'bg-accent hover:bg-accent-hover text-accent-contrast'
                )}
              >
                {added === key ? (
                  <>
                    <Check className="w-4 h-4" /> В корзине
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Купить
                  </>
                )}
              </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
