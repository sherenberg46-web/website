'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, SlidersHorizontal, ArrowDownUp, ChevronDown, Check, X } from 'lucide-react';
import type { Category } from '@/lib/types';
import { API_BASE } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
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
  /**
   * Контекст страницы для превью-счётчика в мобильной шторке: те же
   * product_type/task_type, что страница подставляет в getProductCount.
   * На результат применения фильтров не влияет — только на число на кнопке
   * «Показать N игр».
   */
  baseCountParams?: Record<string, string>;
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

/**
 * Готовые ценовые диапазоны.
 *
 * Поля «от» и «до» никуда не делись, но ими пользуются редко: чтобы отобрать
 * что-то до полусотни, надо решить, какое число вписать. Четыре кнопки
 * закрывают почти все запросы одним нажатием. Пустая граница означает
 * «без ограничения» — до 50 и от 200.
 */
const PRICE_RANGES = [
  { label: 'до 50 BYN', min: '', max: '50' },
  { label: '50 – 100', min: '50', max: '100' },
  { label: '100 – 200', min: '100', max: '200' },
  { label: 'от 200', min: '200', max: '' },
];

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

/** Что считается «фильтром» для мобильной шторки — без sort и search. */
const SHEET_KEYS = [
  'category_id',
  'genre',
  'platform',
  'price_min',
  'price_max',
  'discount_min',
  'is_preorder',
];

/** Плюрализация: 1 игру · 2–4 игры · 5+ игр. */
function pluralGames(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'игру';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'игры';
  return 'игр';
}

/** Пустой снимок фильтров шторки. */
type Pending = {
  platform: string;
  genre: string;
  category_id: string;
  price_min: string;
  price_max: string;
  discount_min: string;
  is_preorder: string;
};
const EMPTY_PENDING: Pending = {
  platform: '',
  genre: '',
  category_id: '',
  price_min: '',
  price_max: '',
  discount_min: '',
  is_preorder: '',
};

export function CatalogFilters({
  categories = [],
  genres = [],
  basePath = '/games',
  hideSearch = false,
  hideDiscount = false,
  sortOptions = DEFAULT_SORT,
  baseCountParams = { product_type: 'game' },
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') ?? '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') ?? '');

  // Мобильные шторки — только на клиенте (портал в body).
  const [mounted, setMounted] = useState(false);
  const [filterSheet, setFilterSheet] = useState(false);
  const [sortSheet, setSortSheet] = useState(false);
  useEffect(() => setMounted(true), []);

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
  const sheetActiveCount = SHEET_KEYS.filter((k) => searchParams.has(k)).length;

  const currentSort = get('sort');
  const showPreorder = basePath === '/games';

  return (
    <div className="mb-6">
      {/* ================= DESKTOP (без изменений) ================= */}
      <div className="hidden md:block">
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
              <span className="w-5 h-5 bg-accent text-accent-contrast text-[10px] font-bold rounded-full flex items-center justify-center">
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

        {/* Жанры — видимым рядом, а не в спрятанной панели. */}
        {genres.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2">
            <span className="shrink-0 self-center text-xs text-text-secondary pr-1">Жанр:</span>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => push({ genre: get('genre') === g ? '' : g })}
                className={clsx(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  get('genre') === g
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Цена — те же четыре диапазона, что и в панели, но под рукой */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2">
          <span className="shrink-0 self-center text-xs text-text-secondary pr-1">Цена:</span>
          {PRICE_RANGES.map((r) => {
            const active = get('price_min') === r.min && get('price_max') === r.max;
            return (
              <button
                key={r.label}
                onClick={() => {
                  const next = active
                    ? { price_min: '', price_max: '' }
                    : { price_min: r.min, price_max: r.max };
                  setPriceMin(next.price_min);
                  setPriceMax(next.price_max);
                  push(next);
                }}
                className={clsx(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  active
                    ? 'bg-accent/10 border-accent/40 text-accent'
                    : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Filter panel */}
        {panelOpen && (
          <div className="mt-4 p-4 bg-bg-card border border-border rounded-xl space-y-5">
            {/* Price range */}
            <div>
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
                Цена, BYN — точный диапазон
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-contrast"
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

      {/* ================= MOBILE ================= */}
      <div className="md:hidden">
        {!hideSearch && (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="search"
              defaultValue={get('search')}
              placeholder="Поиск игр…"
              aria-label="Поиск игр"
              onKeyDown={(e) => {
                if (e.key === 'Enter') push({ search: e.currentTarget.value });
              }}
              onChange={(e) => {
                if (!e.target.value) push({ search: '' });
              }}
              className="h-11 w-full rounded-control border border-border bg-surface-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent/50 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterSheet(true)}
            className={clsx(
              'btn btn-secondary btn-sm flex-1',
              sheetActiveCount > 0 && '!border-accent/50 !text-accent'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {sheetActiveCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-2xs font-bold text-accent-contrast">
                {sheetActiveCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSortSheet(true)}
            className={clsx(
              'btn btn-secondary btn-sm flex-1',
              currentSort && '!border-accent/50 !text-accent'
            )}
          >
            <ArrowDownUp className="h-4 w-4" />
            Сортировка
          </button>
        </div>

        {mounted && (
          <>
            <FilterSheet
              open={filterSheet}
              onClose={() => setFilterSheet(false)}
              onApply={(p) => push(p as unknown as Record<string, string>)}
              searchParams={searchParams}
              genres={genres}
              categories={categories}
              hideDiscount={hideDiscount}
              showPreorder={showPreorder}
              baseCountParams={baseCountParams}
            />
            <SortSheet
              open={sortSheet}
              onClose={() => setSortSheet(false)}
              options={sortOptions}
              current={currentSort}
              onPick={(v) => push({ sort: v })}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------- */

function useSheetLock(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);
}

function SheetShell({
  open,
  title,
  onClose,
  footer,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'md:hidden fixed inset-0 z-[60]',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={clsx(
          'absolute inset-0 bg-black/60 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-card border-t border-border bg-surface-1 shadow-elevation-3 transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="font-bold text-text-primary">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="tap-target -mr-2 grid place-items-center rounded-control text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-border p-3 pb-safe">{footer}</div>}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'inline-flex min-h-[44px] items-center rounded-pill border px-4 text-sm font-medium transition-colors',
        active
          ? 'border-accent/40 bg-accent/10 text-accent'
          : 'border-border bg-surface-2 text-text-secondary hover:text-text-primary'
      )}
    >
      {children}
    </button>
  );
}

function Section({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-border">
      <summary className="tap-target flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="flex items-center gap-2">
          {value && <span className="text-xs text-accent">{value}</span>}
          <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}

function FilterSheet({
  open,
  onClose,
  onApply,
  searchParams,
  genres,
  categories,
  hideDiscount,
  showPreorder,
  baseCountParams,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (p: Pending) => void;
  searchParams: ReturnType<typeof useSearchParams>;
  genres: string[];
  categories: Category[];
  hideDiscount: boolean;
  showPreorder: boolean;
  baseCountParams: Record<string, string>;
}) {
  const [pending, setPending] = useState<Pending>(EMPTY_PENDING);
  const [count, setCount] = useState<number | null>(null);

  // Снимок из URL при каждом открытии.
  useEffect(() => {
    if (!open) return;
    setPending({
      platform: searchParams.get('platform') ?? '',
      genre: searchParams.get('genre') ?? '',
      category_id: searchParams.get('category_id') ?? '',
      price_min: searchParams.get('price_min') ?? '',
      price_max: searchParams.get('price_max') ?? '',
      discount_min: searchParams.get('discount_min') ?? '',
      is_preorder: searchParams.get('is_preorder') ?? '',
    });
  }, [open, searchParams]);

  // Превью счётчика: тот же эндпоинт, что у страницы, но по pending.
  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams();
    Object.entries(baseCountParams).forEach(([k, v]) => params.set(k, v));
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    (Object.entries(pending) as [string, string][]).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('region', getClientRegion());

    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`${API_BASE}/products/count?${params.toString()}`, { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d == null) return;
          setCount(typeof d === 'number' ? d : (d?.count ?? null));
        })
        .catch(() => {
          /* сеть/отмена — оставляем прежнее число */
        });
    }, 300);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [open, pending, baseCountParams, searchParams]);

  useSheetLock(open, onClose);

  const set = (patch: Partial<Pending>) => setPending((p) => ({ ...p, ...patch }));
  const reset = () => setPending(EMPTY_PENDING);
  const apply = () => {
    onApply(pending);
    onClose();
  };

  const hasPending = Object.values(pending).some(Boolean);
  const priceLabel =
    pending.price_min || pending.price_max
      ? `${pending.price_min || '0'}–${pending.price_max || '∞'}`
      : '';
  const catLabel = pending.category_id
    ? categories.find((c) => String(c.id) === pending.category_id)?.name ?? ''
    : '';

  return createPortal(
    <SheetShell
      open={open}
      title="Фильтры"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!hasPending}
            className="btn btn-ghost btn-sm"
          >
            Сбросить
          </button>
          <button type="button" onClick={apply} className="btn btn-primary btn-sm flex-1">
            {count == null ? 'Показать результаты' : `Показать ${count} ${pluralGames(count)}`}
          </button>
        </div>
      }
    >
      <Section label="Платформа" value={pending.platform}>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <Chip
              key={p}
              active={pending.platform === p}
              onClick={() => set({ platform: pending.platform === p ? '' : p })}
            >
              {p}
            </Chip>
          ))}
        </div>
      </Section>

      {genres.length > 0 && (
        <Section label="Жанр" value={pending.genre}>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Chip
                key={g}
                active={pending.genre === g}
                onClick={() => set({ genre: pending.genre === g ? '' : g })}
              >
                {g}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {categories.length > 0 && (
        <Section label="Категория" value={catLabel}>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const v = String(cat.id);
              return (
                <Chip
                  key={cat.id}
                  active={pending.category_id === v}
                  onClick={() => set({ category_id: pending.category_id === v ? '' : v })}
                >
                  {cat.name}
                </Chip>
              );
            })}
          </div>
        </Section>
      )}

      <Section label="Цена" value={priceLabel}>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => {
            const active = pending.price_min === r.min && pending.price_max === r.max;
            return (
              <Chip
                key={r.label}
                active={active}
                onClick={() =>
                  set(
                    active
                      ? { price_min: '', price_max: '' }
                      : { price_min: r.min, price_max: r.max }
                  )
                }
              >
                {r.label}
              </Chip>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={pending.price_min}
            onChange={(e) => set({ price_min: e.target.value })}
            placeholder="от"
            aria-label="Цена от"
            className="h-11 w-24 rounded-control border border-border bg-surface-2 px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent/50 focus:outline-none"
          />
          <span className="text-text-secondary">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={pending.price_max}
            onChange={(e) => set({ price_max: e.target.value })}
            placeholder="до"
            aria-label="Цена до"
            className="h-11 w-24 rounded-control border border-border bg-surface-2 px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent/50 focus:outline-none"
          />
          <span className="text-xs text-text-secondary">BYN</span>
        </div>
      </Section>

      {!hideDiscount && (
        <Section
          label="Скидка"
          value={pending.discount_min ? `от ${pending.discount_min}%` : ''}
        >
          <div className="flex flex-wrap gap-2">
            {DISCOUNTS.map((d) => (
              <Chip
                key={d.value}
                active={pending.discount_min === d.value}
                onClick={() =>
                  set({ discount_min: pending.discount_min === d.value ? '' : d.value })
                }
              >
                {d.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {showPreorder && (
        <button
          type="button"
          onClick={() => set({ is_preorder: pending.is_preorder === 'true' ? '' : 'true' })}
          role="switch"
          aria-checked={pending.is_preorder === 'true'}
          className="flex w-full items-center justify-between px-4 py-3.5"
        >
          <span className="text-sm font-medium text-text-primary">Только предзаказы</span>
          <span
            className={clsx(
              'relative h-6 w-10 shrink-0 rounded-full transition-colors',
              pending.is_preorder === 'true' ? 'bg-accent' : 'bg-border-strong'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                pending.is_preorder === 'true' ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
              )}
            />
          </span>
        </button>
      )}
    </SheetShell>,
    document.body
  );
}

function SortSheet({
  open,
  onClose,
  options,
  current,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  options: { value: string; label: string }[];
  current: string;
  onPick: (v: string) => void;
}) {
  useSheetLock(open, onClose);

  return createPortal(
    <SheetShell open={open} title="Сортировка" onClose={onClose}>
      <div className="py-1" role="radiogroup" aria-label="Сортировка">
        {options.map((o) => {
          const active = o.value === current;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                onPick(o.value);
                onClose();
              }}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 text-left text-sm transition-colors hover:bg-white/5"
            >
              <span className={active ? 'font-medium text-accent' : 'text-text-primary'}>
                {o.label}
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </button>
          );
        })}
      </div>
    </SheetShell>,
    document.body
  );
}
