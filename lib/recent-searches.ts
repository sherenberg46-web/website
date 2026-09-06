/**
 * Недавние поисковые запросы — локально в браузере (аккаунтов на сайте нет).
 *
 * Храним ТОЛЬКО строки запросов, без товаров. Ключ версионируем, чтобы
 * будущая смена формата не ломала чужой localStorage. Тот же паттерн, что в
 * lib/recent.ts (история просмотров).
 */
const KEY = 'gs_recent_searches_v1';
const MAX = 5;

/** Нормализуем для сравнения дублей: без крайних пробелов, в нижнем регистре. */
function norm(q: string): string {
  return q.trim().toLowerCase();
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, MAX);
  } catch {
    return [];
  }
}

/** Добавить запрос в начало списка. Пустые игнорируем, дубли (без регистра) схлопываем. */
export function addRecentSearch(q: string): string[] {
  const value = q.trim();
  if (typeof window === 'undefined' || value.length === 0) return getRecentSearches();
  try {
    const key = norm(value);
    const next = [value, ...getRecentSearches().filter((x) => norm(x) !== key)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentSearches();
  }
}

export function removeRecentSearch(q: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = norm(q);
    const next = getRecentSearches().filter((x) => norm(x) !== key);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentSearches();
  }
}

export function clearRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* приватный режим — не критично */
  }
  return [];
}
