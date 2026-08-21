import type { MetadataRoute } from 'next';
import { getSitemapEntries, getSitemapCount } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { gamePath } from '@/lib/product-url';

/**
 * Карта сайта.
 *
 * Раньше сюда попадали 500 самых свежих товаров из 43 642. Остальные сорок три
 * тысячи карточек поисковик мог найти только переходя по внутренним ссылкам —
 * то есть медленно и далеко не все.
 *
 * Теперь карта разбита на части по 5 000 ссылок: Next отдаёт их как
 * /sitemap/0.xml, /sitemap/1.xml и так далее. Ограничение протокола —
 * 50 000 ссылок и 50 МБ на файл, так что запас есть даже при удвоении каталога.
 *
 * Данные берём из отдельного лёгкого эндпоинта /products/sitemap: обычная
 * выдача тянет всю карточку с описанием, изданиями и пересчётом цен по
 * регионам, а здесь нужны только идентификатор и дата правки.
 */

// Считаем в момент запроса: RAILWAY_PUBLIC_DOMAIN живёт в окружении
// контейнера, а при статической генерации на этапе сборки его нет.
export const dynamic = 'force-dynamic';

const CHUNK = 5000;

const STATIC_PAGES: {
  path: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly';
}[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/games', priority: 0.9, changeFrequency: 'daily' },
  // Посадочная под платформу. Пока каталог целиком PlayStation, платформа
  // одна; с добавлением Xbox/Steam здесь появятся /games/xbox и /games/steam.
  { path: '/games/ps', priority: 0.9, changeFrequency: 'daily' },
  { path: '/sale', priority: 0.9, changeFrequency: 'daily' },
  { path: '/new', priority: 0.8, changeFrequency: 'daily' },
  { path: '/preorders', priority: 0.8, changeFrequency: 'daily' },
  { path: '/subscriptions', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ea-play', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/topup', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/how-to-buy', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/guarantees', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/contacts', priority: 0.5, changeFrequency: 'weekly' },
  // Правовые документы. Приоритет низкий — по ним не ищут, но в индексе они
  // нужны: поисковики считают их признаком настоящего магазина, а не витрины.
  { path: '/offer', priority: 0.3, changeFrequency: 'weekly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'weekly' },
  { path: '/refund', priority: 0.3, changeFrequency: 'weekly' },
];

/**
 * На сколько частей резать карту.
 *
 * Next вызывает эту функцию до генерации и по длине её ответа понимает,
 * сколько файлов существует. Если API недоступен — отдаём одну часть: карта
 * без товаров лучше, чем упавший запрос, поисковик просто зайдёт позже.
 */
export async function generateSitemaps() {
  const total = await getSitemapCount().catch(() => 0);
  const chunks = Math.max(1, Math.ceil(total / CHUNK));
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const entries = await getSitemapEntries(CHUNK, id * CHUNK).catch(() => []);
  const productPages: MetadataRoute.Sitemap = entries.map((e) => ({
    // Облегчённый эндпоинт отдаёт только id и дату правки, без платформы.
    // Весь каталог сейчас PlayStation, поэтому сегмент 'ps' (по умолчанию
    // в gamePath). Адрес совпадает с canonical карточки — sitemap и
    // <link rel=canonical> не должны расходиться.
    url: `${siteUrl}${gamePath(e.id)}`,
    // Дата правки подсказывает роботу, что перечитать, а что пропустить.
    // Цены и скидки меняет парсер, он же двигает updated_at.
    lastModified: e.updated_at ? new Date(e.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Разделы кладём только в первую часть, иначе они продублируются во всех.
  if (id !== 0) return productPages;

  const staticPages: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${siteUrl}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  return [...staticPages, ...productPages];
}
