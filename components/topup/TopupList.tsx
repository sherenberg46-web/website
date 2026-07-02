'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Wallet } from 'lucide-react';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';
import { normalizeImageUrl } from '@/lib/api';

interface Props {
  title: string;
  flag: string;
  note: string;
  products: Product[];
}

/** Список карт пополнения одного региона — сумма, цена, в корзину. */
export function TopupList({ title, flag, note, products }: Props) {
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
      image_url: normalizeImageUrl(p.image_url),
      price_byn: p.price_byn,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'topup',
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{flag}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-text-secondary text-sm mb-5">{note}</p>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-gradient/20 bg-bg-card-hover flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{p.title}</p>
              <p className="text-sm font-bold text-accent">{p.price_byn} BYN</p>
            </div>
            <button
              onClick={() => buy(p)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shrink-0 transition-colors',
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
        ))}
      </div>
    </section>
  );
}
