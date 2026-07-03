import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getProductCount, getProductGenres } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import type { ProductFilters } from '@/lib/types';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Предзаказы',
  description: 'Предзаказы игр PlayStation — закажите игру до выхода по специальной цене.',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

const PRE_SORT = [
  { value: '', label: 'По дате выхода' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
];

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function PreordersPage({ searchParams }: Props) {
  const region = getRegion();
  const offset = Number(searchParams.offset ?? 0);

  // task_type=preorders — тот же фильтр, что в Mini App
  const filters: ProductFilters = {
    task_type: 'preorders',
    region,
    sort: searchParams.sort || undefined,
    platform: searchParams.platform || undefined,
    genre: searchParams.genre || undefined,
    price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const [productsRaw, total, genres] = await Promise.all([
    getProducts(filters).catch(() => []),
    getProductCount({ ...filters, sort: undefined, limit: undefined, offset: undefined }),
    getProductGenres(),
  ]);

  // Бэкенд сортирует предзаказы по дате — цену сортируем здесь
  const products = [...productsRaw];
  if (searchParams.sort === 'price_asc') products.sort((a, b) => (a.price_byn ?? 0) - (b.price_byn ?? 0));
  if (searchParams.sort === 'price_desc') products.sort((a, b) => (b.price_byn ?? 0) - (a.price_byn ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-8">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Доступны для заказа
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Предзаказы</h1>
          <p className="text-text-secondary mt-3 max-w-md">
            Заказывайте игры до официального выхода. Код будет отправлен в день релиза.
          </p>
        </div>
      </ScrollReveal>

      <Suspense>
        <CatalogFilters basePath="/preorders" hideSearch hideDiscount sortOptions={PRE_SORT} genres={genres} />
      </Suspense>

      <p className="text-text-secondary text-sm mb-4">
        Доступно: <span className="text-text-primary font-medium">{total}</span> игр
      </p>

      <ProductGrid products={products} />
      <Suspense>
        <CatalogPagination total={total} pageSize={PAGE_SIZE} offset={offset} basePath="/preorders" />
      </Suspense>
    </div>
  );
}
