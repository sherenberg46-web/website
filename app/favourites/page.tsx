'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavouritesStore } from '@/store/favouritesStore';
import { ProductGrid } from '@/components/products/ProductGrid';

export default function FavouritesPage() {
  const [mounted, setMounted] = useState(false);
  const products = useFavouritesStore((s) => s.products);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
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

      {products.length === 0 ? (
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
