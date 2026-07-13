'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import clsx from 'clsx';
import type { Region } from '@/lib/region';
import { useCartStore } from '@/store/cartStore';

import {
  SUB_PRICES as PRICES,
  PS_IDS as PS_IDS_ALL,
  EA_IDS as EA_IDS_ALL,
  TIER_INFO as TIERS,
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

export function SubscriptionsShowcase({ region }: { region: Region }) {
  const [months, setMonths] = useState<Months>(12);
  const [added, setAdded] = useState<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  function buy(tier: Tier) {
    const id = PS_IDS_ALL[region][tier][months];
    const price = PRICES[region].psplus[months][tier];
    addItem({
      product_id: id,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `PS Plus ${TIERS.find((t) => t.id === tier)!.label} — ${monthsLabel(months)} (${region})`,
      image_url: TIER_IMAGES[tier],
      price_byn: price,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(id);
    setTimeout(() => setAdded(null), 1600);
  }

  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">
            Подписки · регион {region}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">PS Plus</h2>
        </div>

        {/* Выбор срока */}
        <div className="flex gap-1 bg-bg-card border border-border rounded-full p-1">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                months === m
                  ? 'bg-brand-gradient text-white'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {m} мес
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {TIERS.map((tier, i) => {
          const id = PS_IDS_ALL[region][tier.id][months];
          const price = PRICES[region].psplus[months][tier.id];
          const highlighted = tier.id === 'extra';
          return (
            <div
              key={tier.id}
              className={clsx(
                'relative bg-bg-card rounded-2xl border p-6 flex flex-col transition-colors',
                highlighted ? 'border-accent/50 shadow-glow-card' : 'border-border'
              )}
            >
              {highlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-gradient text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Популярный
                </span>
              )}
              <h3 className="font-bold text-lg mb-1">{tier.label}</h3>
              <p className="text-3xl font-bold mb-4">
                {price} <span className="text-sm font-medium text-text-secondary">BYN</span>
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => buy(tier.id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold transition-colors',
                    added === id
                      ? 'bg-accent/20 text-accent'
                      : highlighted
                        ? 'bg-accent hover:bg-accent-hover text-white'
                        : 'bg-white/10 text-text-primary hover:bg-white/15'
                  )}
                >
                  {added === id ? (
                    <>
                      <Check className="w-4 h-4" /> В корзине
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> В корзину
                    </>
                  )}
                </button>
                <Link
                  href="/subscriptions"
                  className="px-3 py-2.5 rounded-full text-sm text-text-secondary border border-border hover:text-text-primary hover:border-accent/40 transition-colors"
                >
                  Ещё
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* EA Play */}
      <div className="mt-4 bg-bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold">EA Play</h3>
          <p className="text-sm text-text-secondary">
            Каталог игр EA, пробные версии новинок и скидки 10%
          </p>
        </div>
        <div className="flex gap-2">
          {([1, 12] as const).map((m) => (
            <Link
              key={m}
              href={`/games/${EA_IDS_ALL[region][m]}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-text-primary hover:bg-white/15 transition-colors"
            >
              {monthsLabel(m)} · {PRICES[region].eaplay[m]} BYN
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
