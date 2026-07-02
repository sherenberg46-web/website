'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check } from 'lucide-react';
import clsx from 'clsx';
import type { Region } from '@/lib/region';
import { useCartStore } from '@/store/cartStore';

// Источник истины по ценам подписок — тот же, что в Telegram Mini App.
// При изменении цен обновлять здесь И в приложении.
const PRICES = {
  UA: {
    psplus: {
      1: { essential: 40, extra: 50, deluxe: 60 },
      3: { essential: 80, extra: 120, deluxe: 130 },
      12: { essential: 160, extra: 260, deluxe: 280 },
    },
    eaplay: { 1: 40, 12: 120 },
  },
  TR: {
    psplus: {
      1: { essential: 55, extra: 80, deluxe: 80 },
      3: { essential: 140, extra: 185, deluxe: 190 },
      12: { essential: 290, extra: 450, deluxe: 530 },
    },
    eaplay: { 1: 35, 12: 150 },
  },
} as const;

const PS_IDS = {
  UA: {
    essential: { 1: 35269, 3: 35270, 12: 35275 },
    extra: { 1: 35273, 3: 35276, 12: 35277 },
    deluxe: { 1: 35274, 3: 35278, 12: 35279 },
  },
  TR: {
    essential: { 1: 35211, 3: 35212, 12: 35213 },
    extra: { 1: 35208, 3: 35209, 12: 35210 },
    deluxe: { 1: 35205, 3: 35206, 12: 35207 },
  },
} as const;

const EA_IDS = {
  UA: { 1: 35280, 12: 35281 },
  TR: { 1: 35214, 12: 35215 },
} as const;

type Tier = 'essential' | 'extra' | 'deluxe';
type Months = 1 | 3 | 12;

const TIERS: { id: Tier; label: string; features: string[] }[] = [
  {
    id: 'essential',
    label: 'Essential',
    features: ['Онлайн-мультиплеер', 'Ежемесячные игры', 'Облачные сохранения', 'Эксклюзивные скидки'],
  },
  {
    id: 'extra',
    label: 'Extra',
    features: ['Всё из Essential', 'Каталог 400+ игр', 'Коллекция Ubisoft+ Classics'],
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    features: ['Всё из Extra', 'Классика PS1/PS2/PSP', 'Пробные версии новинок'],
  },
];

const MONTHS: Months[] = [1, 3, 12];

function monthsLabel(m: Months): string {
  return m === 1 ? '1 месяц' : m === 3 ? '3 месяца' : '12 месяцев';
}

export function SubscriptionsShowcase({ region }: { region: Region }) {
  const [months, setMonths] = useState<Months>(12);
  const [added, setAdded] = useState<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  function buy(tier: Tier) {
    const id = PS_IDS[region][tier][months];
    const price = PRICES[region].psplus[months][tier];
    addItem({
      product_id: id,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `PS Plus ${TIERS.find((t) => t.id === tier)!.label} — ${monthsLabel(months)} (${region})`,
      image_url: '/placeholder.png',
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
                  ? 'bg-brand-gradient text-black'
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
          const id = PS_IDS[region][tier.id][months];
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
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-gradient text-black text-[10px] font-bold rounded-full uppercase tracking-wide">
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
                        ? 'btn-gradient text-black'
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
                  href={`/games/${id}`}
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
              href={`/games/${EA_IDS[region][m]}`}
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
