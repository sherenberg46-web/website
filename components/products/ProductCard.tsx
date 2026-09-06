'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { FitImage } from '@/components/ui/FitImage';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { normalizeImageUrl, getOriginalPrice } from '@/lib/api';
import { gamePath } from '@/lib/product-url';

interface Props {
  product: Product;
  priority?: boolean;
}

/**
 * Карточка товара — мобильно-ориентированная.
 *
 * Иерархия: обложка → название → цена/скидка → «В корзину». Кнопка покупки
 * вынесена из-под обложки (раньше висела поверх artwork и ловила случайные
 * тапы по ссылке карточки). Блок цены фиксированной высоты — карточки в одной
 * строке не «прыгают» от разной длины названия или наличия скидки.
 *
 * Данные и логика прежние: ссылка через gamePath, добавление в корзину —
 * тот же addItem с тем же payload, избранное — тот же favouritesStore.
 * Framer Motion убран: появление мгновенное, микровзаимодействия на CSS.
 */
export function ProductCard({ product, priority = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { isFavourite, toggleFavourite } = useFavouritesStore();

  // Избранное живёт в localStorage: на сервере стор пуст, на клиенте
  // регидратируется. Читаем состояние только после монтирования, иначе
  // отметка ♥ даёт рассинхрон гидратации (как счётчики в шапке).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFav = mounted && isFavourite(product.id);

  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const imageUrl = normalizeImageUrl(product.image_url);
  const defaultEdition = product.editions?.find((e) => e.is_default) ?? product.editions?.[0];

  const platforms = product.platform ? product.platform.split(',').map((p) => p.trim()) : [];
  const platformLabel =
    platforms.length > 0
      ? platforms.join(' · ')
      : product.genre?.split(',')[0]?.trim() ?? 'PlayStation';

  // «Новинка» — по дате релиза (последние 90 дней), а не по task_type:
  // API помечает new_games почти весь каталог. Будущие релизы — «Предзаказ».
  const isNewRelease = (() => {
    if (!product.release_date) return false;
    const days = (Date.now() - new Date(product.release_date).getTime()) / 86400000;
    return days >= 0 && days <= 90;
  })();

  // TR-игры временно не продаём: быстрой покупки с карточки быть не должно.
  const trBlocked =
    product.region === 'TR' &&
    (product.product_type === 'game' || product.product_type === 'dlc');

  const price = product.price_byn;
  const discount = product.discount_pct > 0 ? Math.round(product.discount_pct) : 0;
  const oldPrice =
    discount > 0 && price != null ? getOriginalPrice(price, product.discount_pct) : null;

  function handleAddToCart() {
    if (price == null) return;
    addItem({
      product_id: product.id,
      edition_id: defaultEdition?.id ?? null,
      edition_name: defaultEdition?.name ?? null,
      qty: 1,
      title: product.title,
      image_url: imageUrl,
      price_byn: price,
      original_price_byn:
        product.discount_pct > 0
          ? Math.round((price * 100) / (100 - product.discount_pct))
          : null,
      discount_pct: product.discount_pct,
      product_type: product.product_type,
    });
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="group relative flex flex-col">
      <Link
        href={gamePath(product.id, product.platform)}
        className="block transition-transform active:scale-[0.99]"
      >
        {/* Cover — главный визуальный элемент. Рамка 2:3 — родная пропорция
            обложек PS Store, широкие/квадратные добирает подложка FitImage. */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-card bg-surface-2">
          <FitImage
            src={imageUrl}
            alt={product.title}
            sizes="(max-width: 640px) 45vw, 240px"
            className="absolute inset-0"
            imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
            priority={priority}
          />

          {/* Статус — компактной стопкой в углу, не перекрывает центр обложки */}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {discount > 0 && <Badge variant="new">-{discount}%</Badge>}
            {product.is_preorder ? (
              <Badge variant="preorder">Предзаказ</Badge>
            ) : isNewRelease ? (
              <Badge variant="accent">Новинка</Badge>
            ) : null}
          </div>
        </div>

        {/* Инфоблок */}
        <div className="pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-2xs uppercase tracking-wider text-text-secondary">
              {platformLabel}
            </p>
            {product.rating > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-text-secondary">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-2xs font-medium">{product.rating.toFixed(1)}</span>
              </span>
            )}
          </div>

          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-text-primary">
            {product.title}
          </h3>

          {/* Цена — фиксированная структура, без переносов */}
          <div className="mt-1.5 flex min-h-[1.5rem] items-baseline gap-2 overflow-hidden">
            {price == null ? (
              <span className="whitespace-nowrap text-sm text-text-secondary">Цена по запросу</span>
            ) : price === 0 ? (
              <span className="whitespace-nowrap text-[15px] font-bold text-accent">Бесплатно</span>
            ) : (
              <>
                <span className="shrink-0 whitespace-nowrap text-[15px] font-bold tracking-tight text-text-primary">
                  {price} BYN
                </span>
                {oldPrice != null && (
                  <span className="whitespace-nowrap text-xs text-text-muted line-through">
                    {oldPrice}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Избранное — зона нажатия 44×44, видимый чип компактный */}
      <button
        type="button"
        onClick={() => toggleFavourite(product)}
        aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
        aria-pressed={isFav}
        className="tap-target absolute right-0.5 top-0.5 grid place-items-center"
      >
        <span
          className={clsx(
            'grid h-8 w-8 place-items-center rounded-full backdrop-blur transition-colors',
            isFav
              ? 'bg-accent text-accent-contrast'
              : 'bg-black/45 text-white/85 hover:text-white'
          )}
        >
          <Heart className={clsx('h-4 w-4', isFav && 'fill-current')} />
        </span>
      </button>

      {/* В корзину — вне обложки, ниже цены. Та же логика addItem. */}
      {trBlocked ? (
        <button type="button" disabled className="btn btn-secondary btn-sm btn-block mt-2.5">
          Сейчас недоступно
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={price == null}
          aria-label={`Добавить «${product.title}» в корзину`}
          className={clsx(
            'btn btn-secondary btn-sm btn-block mt-2.5 transition-colors hover:!border-accent/50 hover:!text-accent',
            added && '!text-accent'
          )}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Добавлено
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              В корзину
            </>
          )}
        </button>
      )}
    </article>
  );
}
