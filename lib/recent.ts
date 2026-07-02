// История просмотров товаров — локально в браузере (на сайте нет аккаунтов).
export interface RecentItem {
  id: number;
  title: string;
  image_url: string;
  price_byn: number | null;
  discount_pct: number;
  platform: string;
  product_type: string;
  ts: number;
}

const KEY = 'gs_recently_viewed';
const MAX = 12;

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentItem, 'ts'>): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getRecentlyViewed().filter((i) => i.id !== item.id);
    list.unshift({ ...item, ts: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota — не критично */
  }
}
