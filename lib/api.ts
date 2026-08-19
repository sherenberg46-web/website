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
  CartPromo,
} from './types';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tg-shop-production-1b03.up.railway.app/api/v1';

const STATIC_BASE = 'https://tg-shop-production-1b03.up.railway.app';

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  // Локальные картинки из public/ — карты пополнения, баннеры
  if (url.startsWith('/images/')) return url;
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
  if (!res.ok)
    throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status });
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

/**
 * Ссылки для карты сайта: только идентификатор и дата правки.
 *
 * Отдельный эндпоинт, а не getProducts с большим limit. Обычная выдача
 * возвращает карточку целиком — описание, издания, пересчитанные цены по
 * регионам. На сорока трёх тысячах товаров это десятки мегабайт в память
 * ради списка чисел, а память в этом проекте — основная статья счёта.
 */
export interface SitemapEntry {
  id: number;
  updated_at: string | null;
}

export async function getSitemapEntries(limit = 5000, offset = 0): Promise<SitemapEntry[]> {
  return apiFetch<SitemapEntry[]>(`/products/sitemap?limit=${limit}&offset=${offset}`, {
    revalidate: 3600,
  });
}

export async function getSitemapCount(): Promise<number> {
  const res = await apiFetch<{ count: number }>('/products/sitemap/count', {
    revalidate: 3600,
  });
  return res?.count ?? 0;
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

/**
 * То же, что getProductEditions, но об ошибке сообщает, а не молчит.
 *
 * Обычная версия при любом сбое возвращает пустой список — для витрины это
 * нормально (не показали блок изданий, и ладно). Корзине так нельзя: пустой
 * ответ там означает «издание больше не продаётся», и обрыв связи вычистил
 * бы покупателю корзину.
 */
export async function getProductEditionsStrict(
  id: number,
  region?: string
): Promise<CatalogEdition[]> {
  const r = region ? `?region=${region}` : '';
  return apiFetch<CatalogEdition[]>(`/products/${id}/editions${r}`, { revalidate: 0 });
}

export async function getProductDlc(id: number): Promise<DlcItem[]> {
  try {
    return await apiFetch<DlcItem[]>(`/products/${id}/dlc`, { revalidate: 300 });
  } catch {
    return [];
  }
}

// Отзывы покупателей: только одобренные модератором. Среднее и количество
// нужны для aggregateRating, сами отзывы — для review в разметке Google.
export interface ProductReview {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface ProductReviews {
  average: number;
  count: number;
  items: ProductReview[];
}

export async function getProductReviews(id: number): Promise<ProductReviews> {
  try {
    const r = await apiFetch<ProductReviews>(`/products/${id}/reviews`, { revalidate: 120 });
    return { average: r?.average ?? 0, count: r?.count ?? 0, items: r?.items ?? [] };
  } catch {
    return { average: 0, count: 0, items: [] };
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
/**
 * Просит у сервера промокод 5 % за брошенную корзину.
 *
 * В Mini App это делает планировщик и присылает код ботом. На сайте так нельзя:
 * корзина живёт в localStorage, а канала для сообщения нет — почты мы не
 * собираем, а бот не может написать первым тому, кто его не запускал. Поэтому
 * предложение показывает сам сайт, а сервер лишь выдаёт настоящий код, который
 * потом примет форма заказа.
 */
export async function issueCartPromo(): Promise<CartPromo> {
  const res = await fetch(`${API_BASE}/web-orders/cart-promo`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Вопрос консультанту. Тот же эндпоинт, что у чата в приложении Telegram, —
 * логика и знание каталога общие, отличается только оформление.
 *
 * Кэшировать нечего: каждый ответ зависит от переписки, поэтому обычный fetch
 * без next.revalidate.
 */
export async function askConsultant(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  region: string,
  sessionId: string
): Promise<{
  reply: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  needs_manager?: boolean;
  dialog_id?: number;
}> {
  const res = await fetch(`${API_BASE}/consultant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, region, session_id: sessionId, source: 'site' }),
  });
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.json();
}

/** Оценка диалога клиентом: 1 — помог, -1 — не помог. */
export async function rateConsultant(dialogId: number, rating: 1 | -1): Promise<void> {
  await fetch(`${API_BASE}/consultant/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dialog_id: dialogId, rating }),
  }).catch(() => undefined);
}

/**
 * Действует ли промокод — спрашиваем сервер.
 *
 * Сверять введённый код с тем, что сайт выдал этому браузеру, нельзя: коды
 * бывают и другие (менеджер выдал в переписке, код с прошлого устройства),
 * а решает всё равно приёмник заказа. Раньше форма объявляла такой код
 * «не найден», хотя сервер его принимал и скидку давал, — покупатель видел
 * одну сумму, а в заказ уходила другая.
 */
export async function checkPromo(
  code: string,
  signal?: AbortSignal
): Promise<{ valid: boolean; percent: number; reason: string }> {
  const res = await fetch(
    `${API_BASE}/web-orders/check-promo?code=${encodeURIComponent(code)}`,
    { signal }
  );
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  return res.json();
}

/**
 * Отметить просмотр карточки — на этом строится полка «популярное».
 *
 * Тихая функция: любая ошибка проглатывается. Счётчик просмотров не та вещь,
 * ради которой покупателю стоит показывать сообщение об ошибке.
 */
export async function trackView(productId: number): Promise<void> {
  const { getGuestId } = await import('./guest');
  const guest = getGuestId();
  if (!guest) return;
  try {
    await fetch(`${API_BASE}/recommendations/view?product_id=${productId}`, {
      method: 'POST',
      headers: { 'X-Guest-Id': guest },
      keepalive: true,
    });
  } catch {
    /* не критично */
  }
}

export async function createWebOrder(
  payload: WebOrderPayload,
  signal?: AbortSignal
): Promise<{ order_id?: number; message: string; total_byn?: number; promo_percent?: number }> {
  const res = await fetch(`${API_BASE}/web-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
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

/**
 * Цена на витрине. Копеек в магазине нет — всё целое и округляется вверх.
 *
 * Каталог и так хранит целые цены (парсер округляет вверх при записи), но
 * последняя защита стоит здесь: ни одна дробь не доедет до покупателя, даже
 * если где-то в арифметике появится половина рубля.
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '\u2014';
  return `${Math.ceil(price).toLocaleString('ru-BY')} BYN`;
}
