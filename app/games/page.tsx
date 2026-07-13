import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCategories, getProductGenres, getProducts, getProductCount } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { DataError } from '@/components/ui/DataError';
import type { ProductFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Каталог игр',
  description: 'Все цифровые игры PlayStation в одном месте. Фильтры по платформе, жанру, цене. Лучшие цены в BYN для Беларуси.',
};

const PAGE_SIZE = 20;

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | undefined>;
}

async function CatalogContent({ searchParams }: Props) {
  const offset = Number(searchParams.offset ?? 0);
  const region = getRegion();
  const filters: ProductFilters = {
    category_id: searchParams.category_id ? Number(searchParams.category_id) : undefined,
    search: searchParams.search || undefined,
    // По умолчанию каталог показывает только игры — как «Все игры» в Mini App.
    // Регион обязателен, иначе в выдаче дубли из второго каталога.
    product_type: searchParams.product_type || (searchParams.task_type ? undefined : 'game'),
    sort: searchParams.sort || undefined,
    genre: searchParams.genre || undefined,
    platform: searchParams.platform || undefined,
    is_preorder: searchParams.is_preorder === 'true' ? true : undefined,
    task_type: searchParams.task_type || undefined,
    price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    discount_min: searchParams.discount_min ? Number(searchParams.discount_min) : undefined,
    region,
    limit: PAGE_SIZE,
    offset,
  };

  let products, total;
  try {
    [products, total] = await Promise.all([
      getProducts(filters),
      getProductCount({ ...filters, limit: undefined, offset: undefined }),
    ]);
  } catch {
    return <DataError title="Каталог временно недоступен" />;
  }

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
    getCategories().catch(() => []),
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
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-bg-card rounded-xl" /></div>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
