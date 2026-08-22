import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCategories, getProductGenres, getProducts, getProductCount } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { TrGamesBlocked } from '@/components/products/TrGamesBlocked';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { DataError } from '@/components/ui/DataError';
import type { ProductFilters } from '@/lib/types';

const PAGE_SIZE = 20;

/** Параметры, которые сужают выдачу, а не листают её */
const FILTER_PARAMS = [
  'category_id',
  'search',
  'product_type',
  'sort',
  'genre',
  'platform',
  'is_preorder',
  'task_type',
  'price_min',
  'price_max',
  'discount_min',
] as const;

/**
 * Метаданные каталога зависят от адреса, поэтому считаются, а не заданы разом.
 *
 * Каталог отдаёт одни и те же товары под множеством адресов: фильтры по жанру,
 * платформе, цене, сортировка, поиск. Комбинаций тысячи, содержимое у них —
 * подмножество той же выдачи. Если пустить робота по всем, он потратит обход
 * на них вместо карточек товаров, а в индексе окажется куча почти одинаковых
 * страниц. Поэтому:
 *
 *   • отфильтрованные адреса закрываем от индексации, но оставляем `follow` —
 *     робот пройдёт по ссылкам дальше, к товарам;
 *   • страницы листания (?offset=) индексируем и даём каждой свой canonical.
 *     Схлопывать их на первую страницу нельзя: из каталога в 43 тысячи товаров
 *     робот тогда увидит только первые двадцать.
 */
export function generateMetadata({ searchParams }: Props): Metadata {
  const filtered = FILTER_PARAMS.some((p) => searchParams[p]);
  const offset = Number(searchParams.offset ?? 0);

  if (filtered) {
    return {
      title: 'Каталог игр',
      description:
        'Все цифровые игры PlayStation в одном месте. Фильтры по платформе, жанру, цене. Лучшие цены в BYN для Беларуси.',
      robots: { index: false, follow: true },
    };
  }

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  return {
    title: page > 1 ? `Каталог игр — страница ${page}` : 'Каталог игр',
    description:
      'Все цифровые игры PlayStation в одном месте. Фильтры по платформе, жанру, цене. Лучшие цены в BYN для Беларуси.',
    alternates: { canonical: offset > 0 ? `/games?offset=${offset}` : '/games' },
  };
}

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
  // TR: игры из турецкого каталога временно не продаём — отбивка вместо
  // выдачи, иначе из каталога/поиска можно было положить TR-игру в корзину.
  // Подписки и пополнение это не касается: они на своих страницах.
  if (getRegion() === 'TR') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Каталог игр</h1>
        <TrGamesBlocked />
      </div>
    );
  }

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
