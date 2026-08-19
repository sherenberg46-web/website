'use client';

/**
 * Избранное.
 *
 * Список id хранит браузер, а сами карточки берём с сервера при каждом
 * открытии страницы. Так покупатель видит сегодняшнюю цену и сегодняшнюю
 * скидку, а не те, что были в момент нажатия ♥. Товар, которого больше нет
 * в продаже, отвечает 404 — такой id молча убираем из избранного.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavouritesStore } from '@/store/favouritesStore';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getProductById } from '@/lib/api';
import type { Product } from '@/lib/types';

/** Сколько карточек тянем одновременно — чтобы не открывать 50 соединений. */
const BATCH = 6;

export default function FavouritesPage() {
  const [mounted, setMounted] = useState(false);
  const ids = useFavouritesStore((s) => s.ids);
  const removeFavourite = useFavouritesStore((s) => s.removeFavourite);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0) {
      setProducts([]);
      setFailed(false);
      return;
    }

    let alive = true;
    setFailed(false);

    (async () => {
      const found: Product[] = [];
      const gone: number[] = [];
      let networkError = false;

      for (let i = 0; i < ids.length; i += BATCH) {
        const chunk = ids.slice(i, i + BATCH);
        const part = await Promise.all(
          chunk.map(async (id) => {
            try {
              return await getProductById(id);
            } catch (e: unknown) {
              // 404 — товара больше нет в продаже, это не сбой.
              if ((e as { status?: number }).status === 404) gone.push(id);
              else networkError = true;
              return null;
            }
          })
        );
        part.forEach((p) => {
          if (p) found.push(p);
        });
        if (!alive) return;
      }

      if (!alive) return;
      setProducts(found);
      // Ругаемся только если не показали вообще ничего: одна отвалившаяся
      // карточка из десяти — не повод прятать остальные девять.
      setFailed(networkError && found.length === 0);
      gone.forEach(removeFavourite);
    })();

    return () => {
      alive = false;
    };
  }, [mounted, ids, removeFavourite]);

  if (!mounted || products === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-border border-t-accent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold">Избранное</h1>
        {products.length > 0 && (
          <span className="text-text-secondary text-lg">({products.length})</span>
        )}
      </div>

      {failed ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Не удалось загрузить избранное</h2>
          <p className="text-text-secondary mb-8">
            Проверьте соединение и обновите страницу — сами игры никуда не делись.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Нет избранных игр</h2>
          <p className="text-text-secondary mb-8">
            Нажмите ♥ на карточке игры, чтобы добавить её в избранное
          </p>
          <Link
            href="/games"
            className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors inline-block"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
