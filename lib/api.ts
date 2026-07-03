import type {
  Product,
  Banner,
  Category,
  Collection,
  SaleCollection,
  GameEdition,
  CatalogEdition,
  DlcItem,
  ProductFilters,
  WebOrderPayload,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tg-shop-production-1b03.up.railway.app/api/v1';

const STATIC_BASE = 'https://tg-shop-production-1b03.up.railway.app';

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  return `${STATIC_BASE}${url}`;
}

/** Личный контакт менеджера (не бот) — для кнопок «Написать менеджеру» */
export function getManagerLink(text?: string): string {
  const base = process.env.NEXT_PUBLIC_TG_MANAGER || 'https://t.me/gamestore_by';
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function getTelegramLink(productId?: number): string {
  const bot = process.env.NEXT_PUBLIC_TG_BOT || 'https://t.me/GameDigitalShop_bot';
  if (productId) return `${bot}?startapp=product_${productId}`;
  return bot;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate = 60, ...rest } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// Products
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  (Object.entries(filters) as [string, unknown][]).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ''}`, { revalidate: 60 });
}

export async function getFeaturedProducts(limit = 10, region?: string): Promise<Product[]> {
  const r = region ? `&region=${region}` : '';
  return apiFetch<Product[]>(`/products/featured?limit=${limit}${r}`, { revalidate: 120 });
}

export async function getProductById(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { revalidate: 300 });
}

export async function getProductCount(filters: ProductFilters = {}): Promise<number> {
  const params = new URLSearchParams();
  (Object.entries(filters) as [string, unknown][]).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  // Эндпоинт возвращает {count: N} — разворачиваем (раньше объект рендерился в JSX и ронял каталог)
  try {
    const res = await apiFetch<{ count: number }>(`/products/count${qs ? `?${qs}` : ''}`, {
      revalidate: 60,
    });
    return typeof res === 'number' ? res : res?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getProductEditions(
  id: number,
  region?: string
): Promise<CatalogEdition[]> {
  const r = region ? `?region=${region}` : '';
  try {
    return await apiFetch<CatalogEdition[]>(`/products/${id}/editions${r}`, { revalidate: 300 });
  } catch {
    return [];
  }
}

export async function getProductDlc(id: number): Promise<DlcItem[]> {
  try {
    return await apiFetch<DlcItem[]>(`/products/${id}/dlc`, { revalidate: 300 });
  } catch {
    return [];
  }
}

export async function getProductGenres(): Promise<string[]> {
  try {
    return await apiFetch<string[]>('/products/genres', { revalidate: 3600 });
  } catch {
    return [];
  }
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { revalidate: 3600 });
}

// Banners
export async function getBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>('/banners', { revalidate: 300 });
}

// Collections
export async function getCollections(): Promise<Collection[]> {
  try {
    return await apiFetch<Collection[]>('/collections', { revalidate: 3600 });
  } catch {
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection> {
  return apiFetch<Collection>(`/collections/${slug}`, { revalidate: 300 });
}

// Sale Collections
export async function getSaleCollections(): Promise<SaleCollection[]> {
  try {
    return await apiFetch<SaleCollection[]>('/sale-collections', { revalidate: 300 });
  } catch {
    return [];
  }
}

export async function getSaleCollectionByPath(path: string): Promise<SaleCollection> {
  return apiFetch<SaleCollection>(`/sale-collections/${path}`, { revalidate: 300 });
}

// Recommendations
export async function getPopularProducts(limit = 10, region?: string): Promise<Product[]> {
  const r = region ? `&region=${region}` : '';
  try {
    return await apiFetch<Product[]>(`/recommendations/popular?limit=${limit}${r}`, {
      revalidate: 300,
    });
  } catch {
    return getFeaturedProducts(limit, region);
  }
}

export async function getSimilarProducts(
  productId: number,
  genre?: string | null,
  categoryId?: number,
  region?: string
): Promise<Product[]> {
  try {
    const products = await getProducts({
      genre: genre ?? undefined,
      category_id: categoryId,
      region,
      limit: 8,
    });
    return products.filter((p) => p.id !== productId).slice(0, 6);
  } catch {
    return [];
  }
}

// Web Orders (new endpoint — falls back gracefully)
export async function createWebOrder(
  payload: WebOrderPayload
): Promise<{ order_id?: number; message: string }> {
  const res = await fetch(`${API_BASE}/web-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.detail ?? `HTTP ${res.status}`), {
      status: res.status,
    });
  }
  return res.json();
}

// Helpers
export function getOriginalPrice(price: number, discountPct: number): number {
  if (!discountPct) return price;
  return Math.round((price * 100) / (100 - discountPct));
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—';
  return `${price.toLocaleString('ru-BY')} BYN`;
}
