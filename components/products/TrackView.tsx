'use client';

import { useEffect } from 'react';
import { addRecentlyViewed } from '@/lib/recent';
import type { Product } from '@/lib/types';
import { normalizeImageUrl } from '@/lib/api';

/** Записывает просмотр товара в локальную историю (блок «Вы смотрели»). */
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
  }, [product]);

  return null;
}
