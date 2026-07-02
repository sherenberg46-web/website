'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  categories: Category[];
  genres: string[];
}

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'new', label: 'Новинки' },
  { value: 'discount', label: 'По скидке' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'rating', label: 'По рейтингу' },
];

const PLATFORMS = ['PS5', 'PS4'];

export function CatalogFilters({ categories, genres }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);

  const get = (key: string) => searchParams.get(key) ?? '';

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      params.delete('offset');
      router.push(`/games?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = () => {
    router.push('/games', { scroll: false });
  };

  const hasFilters = ['category_id', 'genre', 'platform', 'sort', 'search', 'product_type'].some(
    (k) => searchParams.has(k)
  );

  return (
    <div className="mb-6">
      {/* Top bar: search + filter toggle */}
      <div className="flex gap-3 mb-4">
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

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
            panelOpen || hasFilters
              ? 'bg-accent/10 border-accent/40 text-accent'
              : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Фильтры</span>
          {hasFilters && (
            <span className="w-5 h-5 bg-accent text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Sort bar (always visible) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SORT_OPTIONS.map((opt) => (
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
        <div className="mt-4 p-4 bg-bg-card border border-border rounded-2xl space-y-5">
          {/* Categories */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Категория
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    push({ category_id: get('category_id') === String(cat.id) ? '' : String(cat.id) })
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
                {genres.slice(0, 20).map((g) => (
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
