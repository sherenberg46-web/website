'use client';

import { useEffect } from 'react';
import { addRecentlyViewed } from '@/lib/recent';
import type { Product } from '@/lib/types';
import { normalizeImageUrl, trackView } from '@/lib/api';

/**
 * Записывает просмотр товара: локально — для блока «Вы смотрели», и на
 * сервере — для полки «популярное».
 *
 * Серверная часть появилась не сразу: считать просмотры умел только Mini App,
 * где личность подтверждена подписью Telegram. Сайт при этом рос отдельно, и
 * полка «популярное» о нём ничего не знала.
 */
export function TrackView({ product }: { product: Product }) {
  useEffect(() => {
    addRecentlyViewed({
      id: product.id,
      title: product.title,
      image_url: normalizeImageUrl(product.image_url),
      price_byn: product.price_byn,
      discount_pct: product.discount_pct,
      platform: product.platform ?? '',
      product_type: product.product_type,
    });
    // Тихо и один раз на открытие карточки. Ошибку не показываем: счётчик
    // просмотров не то, ради чего стоит тревожить покупателя.
    void trackView(product.id);
  }, [product]);

  return null;
}
