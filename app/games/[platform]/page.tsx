import { Suspense } from 'react';
import type { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { getCategories, getProductGenres, getProducts, getProductCount } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { CatalogFilters } from '@/components/products/CatalogFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CatalogPagination } from '@/components/products/CatalogPagination';
import { DataError } from '@/components/ui/DataError';
import { gamePath, isPlatformSegment } from '@/lib/product-url';
import type { ProductFilters } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

/**
 * Настройки платформенного листинга.
 *
 * `apiPlatform` — значение фильтра для бэкенда. Он матчит по LIKE, так что
 * 'PS' ловит и 'PS4', и 'PS5', и 'PS4, PS5'. Пока платформа одна, список
 * из одного элемента; Xbox и Steam добавятся строками, без правки структуры.
 */
const PLATFORMS: Record<string, { label: string; apiPlatform: string; intro: string }> = {
  ps: {
    label: 'PlayStation',
    apiPlatform: 'PS',
    intro:
      'Цифровые игры для PlayStation 4 и PlayStation 5 с активацией на ваш аккаунт. ' +
      'Цены в BYN, оплата удобным способом, доставка кода после оплаты.',
  },
  xbox: {
    label: 'Xbox',
    apiPlatform: 'Xbox',
    intro: 'Цифровые игры и подписки для Xbox с активацией на ваш аккаунт.',
  },
  steam: {
    label: 'Steam',
    apiPlatform: 'Steam',
    intro: 'Цифровые игры для Steam с активацией на ваш аккаунт.',
  },
};

interface Props {
  params: { platform: string };
  searchParams: Record<string, string | undefined>;
}

export function generateMetadata({ params, searchParams }: Props): Metadata {
  // Старый адрес карточки был /games/{id} — один числовой сегмент, как здесь.
  // Такой запрос уводится 308-редиректом в default(), метаданные ему не нужны.
  if (/^\d+$/.test(params.platform)) {
    return {};
  }

  const conf = PLATFORMS[params.platform];
  if (!conf) return { title: 'Игры' };

  const offset = Number(searchParams.offset ?? 0);
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const base = `/games/${params.platform}`;

  return {
    title:
      page > 1
        ? `Игры ${conf.label} — страница ${page}`
        : `Игры ${conf.label} — купить в Беларуси`,
    description: conf.intro,
    // Своя посадочная под платформу: под запрос «купить игры <платформа>»
    // это отдельная страница, а не фильтр каталога.
    alternates: { canonical: offset > 0 ? `${base}?offset=${offset}` : base },
  };
}

async function PlatformCatalog({ platform, searchParams }: { platform: string; searchParams: Props['searchParams'] }) {
  const conf = PLATFORMS[platform];
  const offset = Number(searchParams.offset ?? 0);
  const region = getRegion();

  const filters: ProductFilters = {
    product_type: 'game',
    platform: conf.apiPlatform,
    // Пользовательские сужения поверх платформы — жанр, цена, сортировка.
    search: searchParams.search || undefined,
    sort: searchParams.sort || undefined,
    genre: searchParams.genre || undefined,
    is_preorder: searchParams.is_preorder === 'true' ? true : undefined,
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

export default async function PlatformPage({ params, searchParams }: Props) {
  // Совместимость со старыми адресами: раньше карточка жила на /games/{id} —
  // один числовой сегмент, который теперь попадает сюда. Только чисто
  // числовой сегмент считаем legacy-id и постоянным редиректом (308) уводим
  // на новый адрес /games/{platform}/{id}. Весь текущий каталог —
  // PlayStation, поэтому платформа 'ps'. Прочие неизвестные сегменты — 404.
  if (!isPlatformSegment(params.platform)) {
    if (/^\d+$/.test(params.platform)) {
      permanentRedirect(gamePath(Number(params.platform), 'PS'));
    }
    notFound();
  }

  const conf = PLATFORMS[params.platform];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Игры {conf.label}</h1>
      <p className="text-text-secondary text-sm max-w-2xl mb-6">{conf.intro}</p>
      <FiltersSection />
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-64 bg-bg-card rounded-xl" /></div>}>
        <PlatformCatalog platform={params.platform} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
