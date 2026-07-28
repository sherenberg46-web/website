import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

// Считаем в момент запроса: RAILWAY_PUBLIC_DOMAIN живёт в окружении
// контейнера, а при статической генерации на этапе сборки его нет.
export const dynamic = 'force-dynamic';

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/favourites'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
