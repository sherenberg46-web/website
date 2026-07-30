import type { MetadataRoute } from 'next';
import { getSitemapCount } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';

// Считаем в момент запроса: RAILWAY_PUBLIC_DOMAIN живёт в окружении
// контейнера, а при статической генерации на этапе сборки его нет.
export const dynamic = 'force-dynamic';

const CHUNK = 5000;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();

  // Карта сайта разбита на части (см. app/sitemap.ts). Next отдаёт их по
  // адресам /sitemap/0.xml, /sitemap/1.xml и так далее, но оглавление
  // /sitemap.xml на своём хостинге не создаёт. Поэтому перечисляем все части
  // здесь: robots.txt для поисковика такое же законное место списка карт,
  // как и индексный файл.
  const total = await getSitemapCount().catch(() => 0);
  const chunks = Math.max(1, Math.ceil(total / CHUNK));
  const sitemaps = Array.from({ length: chunks }, (_, i) => `${siteUrl}/sitemap/${i}.xml`);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/favourites',
        // Результаты поиска: содержимое собирается из каталога, своей
        // ценности нет, а вариантов запросов бесконечно много — робот будет
        // ходить по ним вместо карточек товаров.
        '/*?search=',
      ],
    },
    sitemap: sitemaps,
  };
}
