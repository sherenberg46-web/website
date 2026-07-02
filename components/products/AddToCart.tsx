'use client';

import { useState } from 'react';
import { ShoppingCart, Check, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { getTelegramLink, normalizeImageUrl } from '@/lib/api';
import type { Product, GameEdition } from '@/lib/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import clsx from 'clsx';
import { Heart } from 'lucide-react';

interface Props {
  product: Product;
  editions: GameEdition[];
}

export function AddToCart({ product, editions }: Props) {
  const defaultEdition = editions.find((e) => e.is_default) ?? editions[0] ?? null;
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(defaultEdition);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const isFav = isFavourite(product.id);

  const price = product.price_byn;

  function handleAdd() {
    if (!price) return;
    addItem({
      product_id: product.id,
      edition_id: selectedEdition?.id ?? null,
      edition_name: selectedEdition?.name ?? null,
      qty: 1,
      title: product.title,
      image_url: normalizeImageUrl(product.image_url),
      price_byn: price,
      original_price_byn:
        product.discount_pct > 0
          ? Math.round((price * 100) / (100 - product.discount_pct))
          : null,
      discount_pct: product.discount_pct,
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
            {editions.map((ed) => (
              <button
                key={ed.id}
                onClick={() => setSelectedEdition(ed)}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-xl border text-sm transition-all',
                  selectedEdition?.id === ed.id
                    ? 'border-accent/60 bg-accent/10 text-text-primary'
                    : 'border-border bg-bg-card text-text-secondary hover:border-border/80 hover:text-text-primary'
                )}
              >
                <span className="font-medium">{ed.name}</span>
                {ed.price_uah && (
                  <span className="text-xs text-text-secondary">
                    {selectedEdition?.id === ed.id ? '' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <PriceDisplay price={price} discountPct={product.discount_pct} size="lg" />

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
              ? 'btn-gradient text-black hover:opacity-90'
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
