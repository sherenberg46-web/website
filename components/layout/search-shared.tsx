'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { FitImage } from '@/components/ui/FitImage';
import { API_BASE, normalizeImageUrl, formatPrice } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import { gamePath } from '@/lib/product-url';
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/lib/recent-searches';

const DEBOUNCE_MS = 350;
const MIN_CHARS = 2;
const LIMIT = 7;

/**
 * Общая логика поиска — единственный слой, который делят десктопный SearchBox
 * и мобильный SearchOverlay. Каталожный поиск сюда не входит: он URL-driven
 * (см. app/games/page.tsx + CatalogFilters) и живёт по своим правилам.
 *
 * Что здесь: запрос, дебаунс, живые результаты, защита от гонок запросов
 * (AbortController + сверка id ответа), состояние ошибки с повтором, недавние
 * запросы (только строки, localStorage — см. lib/recent-searches).
 *
 * URL-контракт не трогаем: submit всегда ведёт на /games?search=<q>.
 */
export function useLiveSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Недавние запросы читаются только на клиенте — иначе рассинхрон гидратации.
  const [mounted, setMounted] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    setMounted(true);
    setRecent(getRecentSearches());
  }, []);
  const refreshRecent = useCallback(() => setRecent(getRecentSearches()), []);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Монотонный id запроса: ответ применяем только если он от последнего.
  const reqIdRef = useRef(0);
  // Последний запрошенный текст — для «Повторить».
  const lastQueryRef = useRef('');

  // Сброс при смене страницы (недавние запросы не трогаем — они persistent).
  useEffect(() => {
    setOpen(false);
    setQ('');
    setResults([]);
    setError(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, [pathname]);

  const doSearch = useCallback(async (query: string) => {
    lastQueryRef.current = query;
    // Отменяем предыдущий запрос — он больше не нужен и не должен перезаписать
    // свежие результаты, если придёт позже.
    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    const id = ++reqIdRef.current;

    setLoading(true);
    setError(false);
    try {
      // Регион обязателен — иначе в выдаче дубли из TR-каталога.
      const params = new URLSearchParams({
        search: query,
        limit: String(LIMIT),
        region: getClientRegion(),
      });
      const res = await fetch(`${API_BASE}/products?${params}`, { signal: ctl.signal });
      if (id !== reqIdRef.current) return; // пришёл ответ на устаревший запрос
      const data: Product[] = res.ok ? await res.json() : [];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch (e: unknown) {
      // Отмену не считаем ошибкой — просто вышли из гонки.
      if ((e as Error)?.name === 'AbortError') return;
      if (id !== reqIdRef.current) return;
      setError(true);
      setOpen(true);
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }, []);

  function handleChange(val: string) {
    setQ(val);
    setError(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.trim().length < MIN_CHARS) {
      abortRef.current?.abort();
      reqIdRef.current++; // инвалидируем любой ответ в полёте
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    // Показываем «идёт поиск» уже на время дебаунса — иначе между вводом и
    // запросом мелькает «Ничего не найдено».
    setLoading(true);
    setOpen(true);
    timerRef.current = setTimeout(() => doSearch(val.trim()), DEBOUNCE_MS);
  }

  /** Enter / «Показать все результаты» — уходим на каталог. URL-контракт неизменен. */
  function submit() {
    const value = q.trim();
    if (value.length < MIN_CHARS) return;
    setRecent(addRecentSearch(value));
    setOpen(false);
    router.push(`/games?search=${encodeURIComponent(value)}`);
  }

  /** Клик по недавнему запросу: подставить в поле и сразу показать результаты. */
  function applyQuery(query: string) {
    const value = query.trim();
    if (value.length < MIN_CHARS) return;
    setQ(value);
    setRecent(addRecentSearch(value));
    if (timerRef.current) clearTimeout(timerRef.current);
    void doSearch(value);
  }

  function retry() {
    const value = lastQueryRef.current || q.trim();
    if (value.length < MIN_CHARS) return;
    void doSearch(value);
  }

  function removeRecent(query: string) {
    setRecent(removeRecentSearch(query));
  }
  function clearRecent() {
    setRecent(clearRecentSearches());
  }

  return {
    q,
    results,
    open,
    loading,
    error,
    recent,
    mounted,
    setOpen,
    handleChange,
    submit,
    applyQuery,
    retry,
    refreshRecent,
    removeRecent,
    clearRecent,
  };
}

export function ResultRow({ p, onNavigate }: { p: Product; onNavigate: () => void }) {
  return (
    <Link
      href={gamePath(p.id, p.platform)}
      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-2"
      onClick={onNavigate}
    >
      <FitImage
        src={normalizeImageUrl(p.image_url)}
        alt={p.title}
        sizes="44px"
        backdrop={false}
        className="relative w-9 aspect-[3/4] rounded-md shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text-primary">{p.title}</p>
        <p className="text-xs text-text-secondary">
          {formatPrice(p.price_byn)}
          {p.discount_pct > 0 && (
            <span className="ml-1.5 text-accent">-{Math.round(p.discount_pct)}%</span>
          )}
        </p>
      </div>
    </Link>
  );
}
