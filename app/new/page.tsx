import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { DataError } from '@/components/ui/DataError';

export const metadata: Metadata = {
  title: 'Новинки',
  description: 'Новые игры PlayStation — самые свежие релизы в нашем каталоге.',
};

export const revalidate = 120;

export default async function NewPage() {
  const products = await getProducts({ task_type: 'new_games', limit: 40 }).catch(() => null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            Только что вышли
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Новинки</h1>
          <p className="text-text-secondary mt-3 max-w-md">
            Самые свежие релизы — играйте первыми.
          </p>
        </div>
      </ScrollReveal>
      {products === null ? (
        <DataError title="Новинки временно недоступны" />
      ) : (
        <ProductGrid products={products} priority />
      )}
    </div>
  );
}
