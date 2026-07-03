'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { REGIONS, getClientRegion, type Region } from '@/lib/region';
import { RegionBadge } from '@/components/ui/RegionBadge';
import {
  SUB_PRICES,
  PS_IDS,
  EA_IDS,
  TIER_INFO,
  monthsLabel,
  type Tier,
  type Months,
} from '@/lib/subscriptions';

const MONTHS: Months[] = [1, 3, 12];

const TIER_IMAGES: Record<Tier, string> = {
  essential: '/images/ps-essential.jpg',
  extra: '/images/ps-extra.jpg',
  deluxe: '/images/ps-deluxe.jpg',
};

/** Подписки: вкладки региона и срока, карточки тарифов с картинками. */
export function PricingTable() {
  const addItem = useCartStore((s) => s.addItem);
  const [region, setRegion] = useState<Region>('UA');
  const [months, setMonths] = useState<Months>(12);
  const [added, setAdded] = useState<string | null>(null);

  // Стартуем с региона из шапки
  useEffect(() => {
    setRegion(getClientRegion());
  }, []);

  function buy(tier: Tier) {
    const key = `${region}-${tier}-${months}`;
    addItem({
      product_id: PS_IDS[region][tier][months],
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `PS Plus ${TIER_INFO.find((t) => t.id === tier)!.label} — ${monthsLabel(months)} (${region})`,
      image_url: TIER_IMAGES[tier],
      price_byn: SUB_PRICES[region].psplus[months][tier],
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  }

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
      {/* Region + months tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <div className="flex gap-1 bg-bg-card border border-border rounded-full p-1">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                region === r.value
                  ? 'bg-brand-gradient text-black'
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

        <div className="flex gap-1 bg-bg-card border border-border rounded-full p-1">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={clsx(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                months === m
                  ? 'bg-brand-gradient text-black'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {monthsLabel(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {TIER_INFO.map((tier) => {
          const price = SUB_PRICES[region].psplus[months][tier.id];
          const perMonth = Math.round(price / months);
          const key = `${region}-${tier.id}-${months}`;
          const highlighted = tier.id === 'extra';
          return (
            <div
              key={tier.id}
              className={clsx(
                'relative bg-bg-card rounded-3xl border overflow-hidden flex flex-col transition-colors',
                highlighted ? 'border-accent/50 shadow-glow-card' : 'border-border'
              )}
            >
              {/* Image backdrop + clean title overlay (исходники портретные — прямой кроп резал текст) */}
              <div className="relative aspect-[16/7] overflow-hidden">
                <Image
                  src={TIER_IMAGES[tier.id]}
                  alt={`PS Plus ${tier.label}`}
                  fill
                  quality={80}
                  sizes="(max-width: 640px) 90vw, 340px"
                  className="object-cover scale-125 blur-[6px] brightness-[.4]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                    PS Plus
                  </span>
                  <span
                    className={clsx(
                      'text-2xl font-extrabold tracking-tight',
                      tier.id === 'essential' && 'text-sky-300',
                      tier.id === 'extra' && 'text-yellow-300',
                      tier.id === 'deluxe' && 'text-violet-300'
                    )}
                  >
                    {tier.label}
                  </span>
                </div>
                {highlighted && (
                  <span className="absolute top-3 right-3 px-3 py-1 bg-brand-gradient text-black text-[10px] font-bold rounded-full uppercase tracking-wide">
                    Популярный
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg">{tier.label}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold">{price}</span>
                  <span className="text-sm font-medium text-text-secondary ml-1.5">BYN</span>
                  {months > 1 && (
                    <span className="text-xs text-text-secondary ml-2">≈{perMonth} BYN/мес</span>
                  )}
                </p>
                <ul className="space-y-2 my-5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => buy(tier.id)}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors',
                    added === key
                      ? 'bg-accent/20 text-accent'
                      : highlighted
                        ? 'btn-gradient text-black'
                        : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  {added === key ? (
                    <>
                      <Check className="w-4 h-4" /> В корзине
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> В корзину
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EA Play */}
      <div className="mt-6 bg-bg-card rounded-3xl border border-border overflow-hidden flex flex-col sm:flex-row">
        <div className="relative sm:w-64 aspect-[16/9] sm:aspect-auto shrink-0">
          <Image
            src="/images/ea-play.jpg"
            alt="EA Play"
            fill
            quality={90}
            sizes="256px"
            className="object-cover"
          />
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="flex-1">
            <h3 className="font-bold text-lg">EA Play</h3>
            <p className="text-sm text-text-secondary mt-1">
              Каталог игр EA · пробные версии новинок · скидки 10%
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {([1, 12] as const).map((m) => {
              const key = `ea-${region}-${m}`;
              return (
                <button
                  key={m}
                  onClick={() => buyEa(m)}
                  className={clsx(
                    'flex items-center justify-between gap-4 px-4 py-2.5 rounded-full text-sm font-medium transition-colors',
                    added === key
                      ? 'bg-accent/20 text-accent'
                      : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  <span>{monthsLabel(m)}</span>
                  <span className="font-bold">
                    {added === key ? <Check className="w-4 h-4 inline" /> : `${SUB_PRICES[region].eaplay[m]} BYN`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Топ игр по подписке */}
      <Link
        href="/collections/ps-plus-top"
        className="mt-6 flex items-center justify-between bg-bg-card border border-border hover:border-accent/40 rounded-3xl p-6 transition-colors group"
      >
        <div>
          <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
            Топ игр по подписке PS Plus
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Лучшие игры, доступные в каталоге Extra и Deluxe
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-accent shrink-0" />
      </Link>
    </div>
  );
}
