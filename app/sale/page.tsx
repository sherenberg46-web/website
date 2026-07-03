import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getProductCount, getProductGenres, getSaleCollections } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import type { ProductFilters } from '@/lib/types';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Распродажа',
  description: 'Лучшие скидки на цифровые игры PlayStation. Успейте купить по выгодным ценам.',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

const SALE_SORT = [
  { value: '', label: 'По скидке' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
];

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function SalePage({ searchParams }: Props) {
  const region = getRegion();
  const offset = Number(searchParams.offset ?? 0);

  // task_type=sales — серверный фильтр акций, как в Mini App
  const filters: ProductFilters = {
    task_type: 'sales',
    region,
    sort: searchParams.sort || 'discount',
    platform: searchParams.platform || undefined,
    genre: searchParams.genre || undefined,
    price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    discount_min: searchParams.discount_min ? Number(searchParams.discount_min) : undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const [products, total, saleCollections, genres] = await Promise.all([
    getProducts(filters).catch(() => []),
    getProductCount({ ...filters, sort: undefined, limit: undefined, offset: undefined }),
    getSaleCollections(),
    getProductGenres(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Специальные предложения
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Распродажа</h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Скидки до 95% на игры PlayStation. Предложения ограничены по времени.
          </p>
        </div>
      </ScrollReveal>

      {/* Sale collections */}
      {saleCollections.length > 0 && offset === 0 && (
        <ScrollReveal className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {saleCollections.map((sc) => (
              <Link
                key={sc.id}
                href={`/sale/${sc.path}`}
                className="bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/40 transition-colors group"
              >
                <p className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">
                  {sc.title}
                </p>
                {sc.description && (
                  <p className="text-text-secondary text-xs mt-1 line-clamp-2">{sc.description}</p>
                )}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Filters */}
      <Suspense>
        <CatalogFilters basePath="/sale" hideSearch sortOptions={SALE_SORT} genres={genres} />
      </Suspense>

      <p className="text-text-secondary text-sm mb-4">
        Со скидкой: <span className="text-text-primary font-medium">{total}</span> игр
      </p>

      <ProductGrid products={products} />
      <Suspense>
        <CatalogPagination total={total} pageSize={PAGE_SIZE} offset={offset} basePath="/sale" />
      </Suspense>
    </div>
  );
}
