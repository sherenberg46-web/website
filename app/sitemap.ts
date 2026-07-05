import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
