'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Check, Wallet } from 'lucide-react';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';

interface Props {
  products: Product[];
  /** Подпись валюты для карточек без картинки, напр. «злотых» */
  currency?: string;
}

/** Первое отдельное число в названии — номинал карты */
function extractAmount(title: string): number | null {
  const m = title.match(/\b(\d+)\b/);
  return m ? parseInt(m[1], 10) : null;
}

/** Локальные картинки карт пополнения — те же, что в Mini App */
function localImage(title: string): string | null {
  const t = title.toLowerCase();
  const n = extractAmount(t);
  if (n === null) return null;

  const isUA = t.includes('гривен') || t.includes('грн') || t.includes('store ua');
  const isTR = t.includes('store tl') || t.includes('лир');

  if (isUA) {
    const UA: Record<number, string> = {
      400: '/images/topup-400uah.jpg',
      600: '/images/topup600-uah.jpg',
      1000: '/images/topup1000-uah.jpg',
      2000: '/images/topup2000-uah.jpg',
      3000: '/images/topup3000-uah.jpg',
      4000: '/images/topup4000-uah.jpg',
    };
    return UA[n] ?? null;
  }
  if (isTR) {
    const TR: Record<number, string> = {
      250: '/images/topup250-tr.jpg',
      500: '/images/topup500-tr.jpg',
      750: '/images/topup750-tr.jpg',
      1000: '/images/topup1000-tr.jpg',
      1500: '/images/topup1500-tr.jpg',
      2000: '/images/topup2000-tr.jpg',
      2500: '/images/topup2500-tr.jpg',
      3000: '/images/topup3000-tr.jpg',
      4000: '/images/topup4000-tr.jpg',
      5000: '/images/topup5000-tr.jpg',
    };
    return TR[n] ?? null;
  }
  if (t.includes('злот')) {
    const PL = [50, 100, 200, 300, 350, 500, 650, 900, 1100];
    return PL.includes(n) ? `/images/topup${n}-zl.jpg` : null;
  }
  if (t.includes('рупи')) {
    const IN = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
    return IN.includes(n) ? `/images/topup${n}-inr.jpg` : null;
  }
  return null;
}

/** Карты пополнения одного региона: картинка, номинал, цена, в корзину. */
export function TopupList({ products, currency }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState<number | null>(null);

  if (!products.length) return null;

  function buy(p: Product) {
    if (!p.price_byn) return;
    addItem({
      product_id: p.id,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: p.title,
      image_url: localImage(p.title) ?? '/placeholder.png',
      price_byn: p.price_byn,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'topup',
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {products.map((p) => {
        const img = localImage(p.title);
        const amount = extractAmount(p.title);
        return (
          <div
            key={p.id}
            className="bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors flex flex-col"
          >
            <div className="relative aspect-[16/9] bg-bg-card-hover">
              {img ? (
                <Image
                  src={img}
                  alt={p.title}
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 45vw, 300px"
                  className="object-cover"
                />
              ) : (
                /* Нет картинки — аккуратная карточка с номиналом */
                <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-bg-card-hover to-accent-blue/15 flex flex-col items-center justify-center gap-1">
                  <Wallet className="w-6 h-6 text-accent/70" />
                  {amount !== null && (
                    <p className="font-extrabold text-xl text-text-primary leading-none">
                      {amount.toLocaleString('ru-BY')}
                      {currency && (
                        <span className="text-xs font-semibold text-text-secondary ml-1">
                          {currency}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="p-3.5 flex flex-col gap-2 flex-1">
              <p className="text-xs text-text-secondary line-clamp-2 flex-1">{p.title}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-text-primary">{p.price_byn} BYN</span>
                <button
                  onClick={() => buy(p)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors',
                    added === p.id ? 'bg-accent/20 text-accent' : 'btn-gradient text-black'
                  )}
                >
                  {added === p.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Готово
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" /> Купить
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
