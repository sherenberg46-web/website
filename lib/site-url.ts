/**
 * Публичный адрес сайта — для sitemap, robots и OpenGraph.
 *
 * Раньше в трёх местах стояло `process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'`.
 * Переменную на проде не задали, и запасное значение поехало в бой: robots.txt
 * живого сайта отдавал `Sitemap: http://localhost:3000/sitemap.xml`, канонические
 * адреса вели туда же, а превью ссылок в Telegram и соцсетях ломались, потому что
 * metadataBase указывал на localhost.
 *
 * Теперь запасной вариант осмысленный: если явный адрес не задан, берём домен,
 * который Railway сам подставляет в RAILWAY_PUBLIC_DOMAIN. На localhost падаем
 * только когда не запущены ни там, ни там — то есть в локальной разработке.
 *
 * Порядок намеренно такой: свой домен важнее служебного railway.app, поэтому
 * NEXT_PUBLIC_SITE_URL всегда перебивает автоподстановку.
 */

function normalise(url: string): string {
  const withScheme = /^https?:\/\//.test(url) ? url : `https://${url}`;
  return withScheme.replace(/\/+$/, ''); // без хвостового слэша
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalise(explicit);

  // Railway подставляет домен сервиса сам. Переменная серверная, без префикса
  // NEXT_PUBLIC_, поэтому доступна в sitemap, robots и метаданных — они
  // выполняются на сервере.
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return normalise(railway);

  return 'http://localhost:3000';
}

export const SITE_URL = getSiteUrl();
