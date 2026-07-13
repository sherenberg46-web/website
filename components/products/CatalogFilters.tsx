'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  categories?: Category[];
  genres?: string[];
  /** Куда пушить URL с параметрами (по умолчанию /games) */
  basePath?: string;
  /** Спрятать поиск (на страницах распродажи/предзаказов он не нужен) */
  hideSearch?: boolean;
  /** Спрятать фильтр по размеру скидки */
  hideDiscount?: boolean;
  /** Свой набор сортировок */
  sortOptions?: { value: string; label: string }[];
}

const DEFAULT_SORT = [
  { value: '', label: 'По умолчанию' },
  { value: 'new', label: 'Новинки' },
  { value: 'discount', label: 'По скидке' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'rating', label: 'По рейтингу' },
];

const PLATFORMS = ['PS5', 'PS4'];

const DISCOUNTS = [
  { value: '30', label: 'от 30%' },
  { value: '50', label: 'от 50%' },
  { value: '70', label: 'от 70%' },
  { value: '90', label: 'от 90%' },
];

const FILTER_KEYS = [
  'category_id',
  'genre',
  'platform',
  'sort',
  'search',
  'product_type',
  'price_min',
  'price_max',
  'discount_min',
];

export function CatalogFilters({
  categories = [],
  genres = [],
  basePath = '/games',
  hideSearch = false,
  hideDiscount = false,
  sortOptions = DEFAULT_SORT,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') ?? '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') ?? '');

  const get = (key: string) => searchParams.get(key) ?? '';

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete('offset');
      const qs = params.toString();
      router.push(`${basePath}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, searchParams, basePath]
  );

  const clearAll = () => {
    setPriceMin('');
    setPriceMax('');
    router.push(basePath, { scroll: false });
  };

  const applyPrice = () => {
    const min = priceMin.trim();
    const max = priceMax.trim();
    push({
      price_min: min && Number(min) > 0 ? min : '',
      price_max: max && Number(max) > 0 ? max : '',
    });
  };

  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k));
  const activeCount = FILTER_KEYS.filter((k) => searchParams.has(k)).length;

  return (
    <div className="mb-6">
      {/* Top bar: search + filter toggle */}
      <div className="flex gap-3 mb-4">
        {!hideSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="search"
              defaultValue={get('search')}
              placeholder="Поиск игр..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  push({ search: e.currentTarget.value });
                }
              }}
              onChange={(e) => {
                if (!e.target.value) push({ search: '' });
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        )}

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
            hideSearch && 'flex-1 sm:flex-none justify-center',
            panelOpen || hasFilters
              ? 'bg-accent/10 border-accent/40 text-accent'
              : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Фильтры</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort bar (always visible) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => push({ sort: opt.value })}
            className={clsx(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              get('sort') === opt.value
                ? 'bg-accent/10 border-accent/40 text-accent'
                : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {panelOpen && (
        <div className="mt-4 p-4 bg-bg-card border border-border rounded-xl space-y-5">
          {/* Price range */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Цена, BYN
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                placeholder="от"
                className="w-24 px-3 py-2 bg-bg-page border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50"
              />
              <span className="text-text-secondary">—</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                placeholder="до"
                className="w-24 px-3 py-2 bg-bg-page border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/50"
              />
              <button
                onClick={applyPrice}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-white"
              >
                ОК
              </button>
            </div>
          </div>

          {/* Discount size */}
          {!hideDiscount && (
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                Скидка
              </p>
              <div className="flex flex-wrap gap-2">
                {DISCOUNTS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() =>
                      push({ discount_min: get('discount_min') === d.value ? '' : d.value })
                    }
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      get('discount_min') === d.value
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'border-border text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Платформа
            </p>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => push({ platform: get('platform') === p ? '' : p })}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    get('platform') === p
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'border-border text-text-secondary hover:text-text-primary'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                Жанр
              </p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                {genres.slice(0, 24).map((g) => (
                  <button
                    key={g}
                    onClick={() => push({ genre: get('genre') === g ? '' : g })}
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      get('genre') === g
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'border-border text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                Категория
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      push({
                        category_id: get('category_id') === String(cat.id) ? '' : String(cat.id),
                      })
                    }
                    className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      get('category_id') === String(cat.id)
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'border-border text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}
