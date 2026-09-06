'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, X, RotateCw, Clock } from 'lucide-react';
import { useLiveSearch, ResultRow } from './search-shared';

/**
 * Живой поиск в шапке (десктоп) с выпадающим списком.
 *
 * Мобильный поиск — отдельный полноэкранный SearchOverlay (открывается из
 * нижней навигации). Общая логика (дебаунс, гонки, ошибка, недавние запросы)
 * — в ./search-shared. Здесь только десктопная подача.
 */
export function SearchBox() {
  const {
    q,
    results,
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
  } = useLiveSearch();

  const boxRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const close = () => {
    setFocused(false);
    setOpen(false);
  };
  const handleSubmit = () => {
    setFocused(false);
    submit();
  };

  const query = q.trim();
  const showRecent = focused && query.length < 2 && mounted && recent.length > 0;
  const showResults = focused && query.length >= 2;
  const dropdownOpen = showRecent || showResults;

  // Закрытие выпадающего списка по клику вне. Esc обрабатываем на самом
  // поле (см. onKeyDown) — иначе браузер сначала по-своему очистит
  // type="search", и до нашего обработчика Esc не дойдёт «как задумано».
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [setOpen]);

  return (
    <div ref={boxRef} className="relative hidden md:block w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
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
            onFocus={() => {
              setFocused(true);
              refreshRecent();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault(); // не даём type="search" самому очистить поле
                setFocused(false);
                setOpen(false);
              }
            }}
            placeholder="Поиск игр…"
            aria-label="Поиск игр"
            className="w-full bg-bg-elevated border border-border rounded-control pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-accent/60 transition-colors"
          />
        </div>
      </form>

      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-card border border-border bg-surface-3 shadow-elevation-2 z-50">
          {showRecent ? (
            <div>
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                <span className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">
                  Недавние
                </span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Очистить
                </button>
              </div>
              {recent.map((r) => (
                <div
                  key={r}
                  className="group flex items-center gap-2 pr-2 transition-colors hover:bg-surface-2"
                >
                  <button
                    type="button"
                    onClick={() => applyQuery(r)}
                    className="flex flex-1 items-center gap-2.5 px-3 py-2 text-left text-sm text-text-primary min-w-0"
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0 text-text-secondary" />
                    <span className="truncate">{r}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecent(r)}
                    aria-label={`Удалить «${r}» из недавних`}
                    className="shrink-0 rounded p-1 text-text-secondary opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm text-text-secondary">Не удалось выполнить поиск</span>
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Повторить
              </button>
            </div>
          ) : results.length === 0 ? (
            loading ? (
              <p className="px-4 py-3 text-sm text-text-secondary">Поиск…</p>
            ) : (
              <div className="px-4 py-3">
                <p className="text-sm text-text-primary">Ничего не найдено</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Попробуйте изменить запрос или проверить написание.
                </p>
              </div>
            )
          ) : (
            <>
              {results.map((p) => (
                <ResultRow key={p.id} p={p} onNavigate={close} />
              ))}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full border-t border-border px-4 py-2.5 text-left text-xs font-medium text-accent transition-colors hover:bg-accent/10"
              >
                Показать все результаты →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
