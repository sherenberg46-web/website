'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { API_BASE, normalizeImageUrl, formatPrice } from '@/lib/api';
import { getClientRegion } from '@/lib/region';

/** Общая логика живого поиска — для десктопной и мобильной версий. */
function useLiveSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Сброс при смене страницы
  useEffect(() => {
    setOpen(false);
    setQ('');
    setResults([]);
  }, [pathname]);

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      // Регион обязателен — иначе в выдаче появляются дубли из TR-каталога
      const params = new URLSearchParams({
        search: query,
        limit: '7',
        region: getClientRegion(),
      });
      const res = await fetch(`${API_BASE}/products?${params}`);
      const data: Product[] = res.ok ? await res.json() : [];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(val: string) {
    setQ(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(val.trim()), 350);
  }

  function submit() {
    if (q.trim().length < 2) return;
    setOpen(false);
    router.push(`/games?search=${encodeURIComponent(q.trim())}`);
  }

  return { q, results, open, loading, setOpen, handleChange, submit };
}

function ResultRow({ p, onNavigate }: { p: Product; onNavigate: () => void }) {
  return (
    <Link
      href={`/games/${p.id}`}
      className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
      onClick={onNavigate}
    >
      <div className="relative w-11 h-11 rounded-md overflow-hidden bg-bg-card-hover shrink-0">
        <Image
          src={normalizeImageUrl(p.image_url)}
          alt={p.title}
          fill
          sizes="44px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary truncate">{p.title}</p>
        <p className="text-xs text-text-secondary">
          {formatPrice(p.price_byn)}
          {p.discount_pct > 0 && (
            <span className="text-accent ml-1.5">-{Math.round(p.discount_pct)}%</span>
          )}
        </p>
      </div>
    </Link>
  );
}

/** Живой поиск в шапке (десктоп) с выпадающими результатами. */
export function SearchBox() {
  const { q, results, open, loading, setOpen, handleChange, submit } = useLiveSearch();
  const boxRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpen]);

  return (
    <div ref={boxRef} className="relative hidden md:block w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="relative">
          {loading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          )}
          <input
            type="search"
            value={q}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Поиск игр…"
            aria-label="Поиск игр"
            className="w-full bg-bg-card border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-accent transition-colors"
          />
        </div>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">Ничего не найдено</p>
          ) : (
            <>
              {results.map((p) => (
                <ResultRow key={p.id} p={p} onNavigate={() => setOpen(false)} />
              ))}
              <button
                onClick={submit}
                className="w-full px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors text-left border-t border-border"
              >
                Все результаты →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Мобильный поиск: иконка в шапке → панель под шапкой с живыми результатами. */
export function MobileSearch() {
  const { q, results, open, loading, setOpen, handleChange, submit } = useLiveSearch();
  const [panelOpen, setPanelOpen] = useState(false);
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (panelOpen) inputRef.current?.focus();
  }, [panelOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label={panelOpen ? 'Закрыть поиск' : 'Поиск игр'}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
      >
        {panelOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      {panelOpen && (
        <div className="fixed left-0 right-0 top-14 z-50 glass border-b border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="relative">
              {loading ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              )}
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Поиск игр…"
                aria-label="Поиск игр"
                className="w-full bg-bg-page border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-accent transition-colors"
              />
            </div>
          </form>

          {open && (
            <div className="mt-2 bg-bg-card border border-border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-text-secondary">Ничего не найдено</p>
              ) : (
                <>
                  {results.map((p) => (
                    <ResultRow key={p.id} p={p} onNavigate={() => setPanelOpen(false)} />
                  ))}
                  <button
                    onClick={submit}
                    className="w-full px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors text-left border-t border-border"
                  >
                    Все результаты →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
