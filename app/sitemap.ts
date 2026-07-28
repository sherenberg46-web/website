import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';

// Считаем в момент запроса: RAILWAY_PUBLIC_DOMAIN живёт в окружении
// контейнера, а при статической генерации на этапе сборки его нет.
export const dynamic = 'force-dynamic';

const SITE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/games',
    '/sale',
    '/new',
    '/preorders',
    '/subscriptions',
    '/topup',
    '/how-to-buy',
    '/guarantees',
    '/contacts',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
  }));

  // Товары — до 500 самых свежих, чтобы sitemap не разрастался
  const products = await getProducts({ product_type: 'game', region: 'UA', limit: 500 }).catch(
    () => []
  );
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/games/${p.id}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...productPages];
}
