'use client';

import { useEffect, useRef } from 'react';
import { Search, Loader2, ArrowLeft, X, RotateCw, Clock } from 'lucide-react';
import { useLiveSearch, ResultRow } from './search-shared';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Полноэкранный мобильный поиск — открывается из нижней навигации.
 *
 * Отдельный экран, а не выпадашка: [←] [поле +×], ниже — недавние запросы
 * либо результаты. Общая логика (дебаунс, гонки, ошибка, недавние) — в
 * ./search-shared, та же, что у десктопного SearchBox.
 *
 * Рендерится из MobileTabBar (вне <main>/template.tsx), поэтому fixed работает
 * без портала. Блокировку прокрутки фона делает MobileTabBar.
 */
export function SearchOverlay({ open, onClose }: Props) {
  const {
    q,
    results,
    loading,
    error,
    recent,
    mounted,
    handleChange,
    submit,
    applyQuery,
    retry,
    refreshRecent,
    removeRecent,
    clearRecent,
  } = useLiveSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    refreshRecent();
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose, refreshRecent]);

  if (!open) return null;

  const query = q.trim();
  const short = query.length < 2;

  // submit() навигирует на /games?search=…; сам оверлей не закрывает
  // (его видимостью управляет MobileTabBar). Если поиск идёт со страницы
  // /games, pathname не меняется и авто-закрытие по смене маршрута не
  // срабатывает — закрываем явно.
  const handleSubmit = () => {
    submit();
    onClose();
  };

  return (
    <div
      className="md:hidden fixed inset-0 z-[60] flex flex-col bg-bg-page"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск игр"
    >
      <div className="pt-safe shrink-0 border-b border-border">
        <div className="flex items-center gap-1.5 h-14 px-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть поиск"
            className="tap-target flex items-center justify-center rounded-control text-text-secondary hover:text-text-primary shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form
            className="flex-1"
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
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Поиск игр…"
                aria-label="Поиск игр"
                className="w-full h-11 bg-surface-2 border border-border rounded-control pl-9 pr-10 text-sm text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-accent/60 transition-colors"
              />
              {q.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleChange('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Очистить"
                  className="absolute right-1 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-control text-text-secondary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {short ? (
          mounted && recent.length > 0 ? (
            <div className="py-1">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-2xs font-semibold uppercase tracking-wider text-text-secondary">
                  Недавние
                </span>
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Очистить
                </button>
              </div>
              {recent.map((r) => (
                <div key={r} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => applyQuery(r)}
                    className="flex min-h-[48px] flex-1 items-center gap-3 px-4 text-left text-sm text-text-primary min-w-0"
                  >
                    <Clock className="w-4 h-4 shrink-0 text-text-secondary" />
                    <span className="truncate">{r}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecent(r)}
                    aria-label={`Удалить «${r}» из недавних`}
                    className="tap-target grid place-items-center text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-sm text-text-secondary">
              Введите название игры — минимум 2 символа
            </p>
          )
        ) : error ? (
          <div className="px-4 py-6">
            <p className="text-sm text-text-primary">Не удалось выполнить поиск</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Повторить
            </button>
          </div>
        ) : results.length === 0 ? (
          loading ? (
            <p className="px-4 py-6 text-sm text-text-secondary">Поиск…</p>
          ) : (
            <div className="px-4 py-6">
              <p className="text-sm text-text-primary">Ничего не найдено</p>
              <p className="mt-1 text-sm text-text-secondary">
                Попробуйте изменить запрос или проверить написание.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleChange('');
                  inputRef.current?.focus();
                }}
                className="mt-3 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Очистить поиск
              </button>
            </div>
          )
        ) : (
          <div className="divide-y divide-border">
            {results.map((p) => (
              <ResultRow key={p.id} p={p} onNavigate={onClose} />
            ))}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-3.5 text-left text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Показать все результаты →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
