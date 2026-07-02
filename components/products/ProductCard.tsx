'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { normalizeImageUrl, getTelegramLink } from '@/lib/api';

interface Props {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const isFav = isFavourite(product.id);

  const imageUrl = normalizeImageUrl(product.image_url);
  const defaultEdition = product.editions?.find((e) => e.is_default) ?? product.editions?.[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.price_byn) return;
    addItem({
      product_id: product.id,
      edition_id: defaultEdition?.id ?? null,
      edition_name: defaultEdition?.name ?? null,
      qty: 1,
      title: product.title,
      image_url: imageUrl,
      price_byn: product.price_byn,
      original_price_byn:
        product.discount_pct > 0
          ? Math.round((product.price_byn * 100) / (100 - product.discount_pct))
          : null,
      discount_pct: product.discount_pct,
      product_type: product.product_type,
    });
  }

  function handleToggleFav(e: React.MouseEvent) {
    e.preventDefault();
    toggleFavourite(product);
  }

  const platforms = product.platform ? product.platform.split(',').map((p) => p.trim()) : [];

  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative"
    >
      <Link href={`/games/${product.id}`} className="block">
        <div
          className="bg-bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 group-hover:border-accent/30 group-hover:shadow-glow-card-hover"
        >
          {/* Cover image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-bg-card-hover">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 45vw, 208px"
              quality={85}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
              }}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_preorder && <Badge variant="preorder">Предзаказ</Badge>}
              {product.discount_pct > 0 && (
                <Badge variant="accent">-{Math.round(product.discount_pct)}%</Badge>
              )}
              {product.task_type === 'new_games' && !product.discount_pct && (
                <Badge variant="new">Новинка</Badge>
              )}
            </div>

            {/* Platform badges */}
            {platforms.length > 0 && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                {platforms.includes('PS5') && <Badge variant="ps5">PS5</Badge>}
                {platforms.includes('PS4') && <Badge variant="ps4">PS4</Badge>}
              </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-100 translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent text-black text-xs font-semibold rounded-xl hover:bg-accent/90 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                В корзину
              </button>
              <button
                onClick={handleToggleFav}
                className={clsx(
                  'w-9 flex-shrink-0 flex items-center justify-center py-2 rounded-xl border transition-colors',
                  isFav
                    ? 'bg-accent/20 border-accent/50 text-accent'
                    : 'bg-black/60 border-border text-text-secondary hover:text-text-primary'
                )}
              >
                <Heart className={clsx('w-3.5 h-3.5', isFav && 'fill-current')} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            {product.genre && (
              <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-1 truncate">
                {product.genre.split(',')[0].trim()}
              </p>
            )}
            <h3 className="text-text-primary text-sm font-medium leading-tight line-clamp-2 mb-2">
              {product.title}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <PriceDisplay
                price={product.price_byn}
                discountPct={product.discount_pct}
                size="sm"
              />
              {product.rating > 0 && (
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[11px] font-medium text-text-secondary">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
