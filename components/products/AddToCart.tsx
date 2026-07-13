'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Heart, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { normalizeImageUrl, getTelegramLink } from '@/lib/api';
import type { Product, CatalogEdition } from '@/lib/types';
import type { Region } from '@/lib/region';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

interface Props {
  product: Product;
  editions: CatalogEdition[];
  region: Region;
}

function editionPrice(ed: CatalogEdition, region: Region): number | null {
  const p = region === 'TR' ? ed.price_byn_tr : ed.price_byn;
  return p && p > 0 ? p : null;
}

export function AddToCart({ product, editions, region }: Props) {
  // По умолчанию — издание, которое и есть этот товар (как в Mini App),
  // чтобы цена совпадала с карточкой каталога.
  const defaultIdx = (() => {
    const match = editions.findIndex((e) => e.linked_product_id === product.id);
    return match >= 0 ? match : 0;
  })();
  const [idx, setIdx] = useState(defaultIdx);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const isFav = isFavourite(product.id);

  const selected = editions[idx] ?? null;
  const productPrice =
    region === 'TR' ? product.price_byn_tr ?? product.price_byn : product.price_byn;
  const price = selected ? editionPrice(selected, region) ?? productPrice : productPrice;
  const discount = selected?.discount_pct ?? product.discount_pct;

  // Сравнение цен по регионам (обе есть в базе)
  const uaPrice = product.price_byn;
  const trPrice = product.price_byn_tr;
  const showCompare =
    product.product_type === 'game' && uaPrice != null && trPrice != null && uaPrice !== trPrice;
  const cheaper: Region = (uaPrice ?? Infinity) <= (trPrice ?? Infinity) ? 'UA' : 'TR';

  function handleAdd() {
    if (!price) return;
    addItem({
      product_id: product.id,
      edition_id: selected?.id ?? null,
      edition_name: selected?.edition_name ?? null,
      qty: 1,
      title: product.title,
      image_url: normalizeImageUrl(product.image_url),
      price_byn: price,
      original_price_byn:
        discount > 0 ? Math.round((price * 100) / (100 - discount)) : null,
      discount_pct: discount,
      product_type: product.product_type,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Edition selector */}
      {editions.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-text-secondary font-medium">Издание:</p>
          <div className="grid grid-cols-1 gap-2">
            {editions.map((ed, i) => {
              const p = editionPrice(ed, region);
              return (
                <button
                  key={ed.id}
                  onClick={() => setIdx(i)}
                  className={clsx(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border text-sm transition-all text-left',
                    i === idx
                      ? 'border-accent/60 bg-accent/10 text-text-primary'
                      : 'border-border bg-bg-card text-text-secondary hover:border-border/80 hover:text-text-primary'
                  )}
                >
                  <span className="font-medium">{ed.edition_name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    {ed.discount_pct > 0 && (
                      <span className="text-[10px] font-bold text-white bg-accent rounded-full px-1.5 py-0.5">
                        -{ed.discount_pct}%
                      </span>
                    )}
                    <span className={clsx('font-semibold', i === idx ? 'text-accent' : '')}>
                      {ed.is_free ? 'Бесплатно' : p != null ? `${p} BYN` : '—'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price */}
      <PriceDisplay price={price} discountPct={discount} size="lg" />

      {/* Region price comparison */}
      {showCompare && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full border',
              cheaper === 'UA'
                ? 'border-accent/50 bg-accent/10 text-accent font-semibold'
                : 'border-border text-text-secondary'
            )}
          >
            UA: {uaPrice} BYN{cheaper === 'UA' && ' · выгоднее'}
          </span>
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full border',
              cheaper === 'TR'
                ? 'border-accent/50 bg-accent/10 text-accent font-semibold'
                : 'border-border text-text-secondary'
            )}
          >
            TR: {trPrice} BYN{cheaper === 'TR' && ' · выгоднее'}
          </span>
          {cheaper === 'TR' && (
            <span className="text-text-secondary w-full">
              Покупка игр из TR-каталога временно приостановлена — уточните у менеджера.
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={!price}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all',
            added
              ? 'bg-green-500/20 border border-green-500/40 text-green-400'
              : price
              ? 'bg-accent hover:bg-accent-hover text-white hover:opacity-90'
              : 'bg-bg-card border border-border text-text-secondary cursor-not-allowed'
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Добавлено
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              В корзину
            </>
          )}
        </button>

        <button
          onClick={() => toggleFavourite(product)}
          className={clsx(
            'w-12 flex items-center justify-center rounded-full border transition-colors',
            isFav
              ? 'border-accent/50 bg-accent/10 text-accent'
              : 'border-border bg-bg-card text-text-secondary hover:text-text-primary'
          )}
        >
          <Heart className={clsx('w-5 h-5', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Telegram CTA */}
      <a
        href={getTelegramLink(product.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-border text-text-secondary text-sm font-medium hover:border-accent/40 hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
        </svg>
        Купить в Telegram
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
