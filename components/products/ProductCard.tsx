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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative"
    >
      <Link href={`/games/${product.id}`} className="block">
        <div className="rounded-lg overflow-hidden bg-bg-card transition-all duration-300 group-hover:bg-bg-card-hover group-hover:shadow-glow-card">
          {/* Cover image */}
          <div className="relative aspect-square overflow-hidden bg-bg-card-hover">
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 45vw, 288px"
              quality={85}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority={priority}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.png';
              }}
            />

            {/* Затемнение при наведении */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* Бейджи статуса */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_preorder && <Badge variant="preorder">Предзаказ</Badge>}
              {product.task_type === 'new_games' && !product.discount_pct && (
                <Badge variant="new">Новинка</Badge>
              )}
            </div>

            {/* Избранное — появляется при наведении */}
            <button
              onClick={handleToggleFav}
              aria-label="В избранное"
              className={clsx(
                'absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-md backdrop-blur transition-all duration-200',
                isFav
                  ? 'bg-accent text-white opacity-100'
                  : 'bg-black/50 text-white/80 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              )}
            >
              <Heart className={clsx('w-4 h-4', isFav && 'fill-current')} />
            </button>

            {/* Кнопка корзины — при наведении */}
            <div className="absolute bottom-2 left-2 right-2 opacity-100 translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-md transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                В корзину
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            {/* Платформа + рейтинг */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-text-secondary text-[10px] uppercase tracking-wider truncate">
                {platforms.length > 0 ? platforms.join(' · ') : product.genre?.split(',')[0].trim() ?? 'PlayStation'}
              </p>
              {product.rating > 0 && (
                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[11px] font-medium text-text-secondary">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            <h3 className="text-text-primary text-sm font-semibold leading-tight line-clamp-2 mb-2 min-h-[2.25rem]">
              {product.title}
            </h3>

            {/* Цена в стиле Instant Gaming */}
            <PriceDisplay price={product.price_byn} discountPct={product.discount_pct} size="sm" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
