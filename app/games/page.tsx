import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCategories, getProductGenres, getProducts, getProductCount } from '@/lib/api';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import type { ProductFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Каталог игр',
  description: 'Все цифровые игры PlayStation в одном месте. Фильтры по платформе, жанру, цене. Лучшие цены в BYN для Беларуси.',
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: Record<string, string | undefined>;
}

async function CatalogContent({ searchParams }: Props) {
  const offset = Number(searchParams.offset ?? 0);
  const filters: ProductFilters = {
    category_id: searchParams.category_id ? Number(searchParams.category_id) : undefined,
    search: searchParams.search || undefined,
    product_type: searchParams.product_type || undefined,
    sort: searchParams.sort || undefined,
    genre: searchParams.genre || undefined,
    platform: searchParams.platform || undefined,
    is_preorder: searchParams.is_preorder === 'true' ? true : undefined,
    task_type: searchParams.task_type || undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const [products, total] = await Promise.all([
    getProducts(filters),
    getProductCount({ ...filters, limit: undefined, offset: undefined }),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-text-secondary text-sm">
          Найдено: <span className="text-text-primary font-medium">{total}</span> товаров
        </p>
      </div>
      <ProductGrid products={products} />
      <CatalogPagination total={total} pageSize={PAGE_SIZE} offset={offset} />
    </>
  );
}

async function FiltersSection() {
  const [categories, genres] = await Promise.all([
    getCategories(),
    getProductGenres(),
  ]);
  return (
    <Suspense>
      <CatalogFilters categories={categories} genres={genres} />
    </Suspense>
  );
}

export default async function GamesPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Каталог игр</h1>
      <FiltersSection />
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-bg-card rounded-2xl" /></div>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
