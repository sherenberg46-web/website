import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Calendar, Monitor } from 'lucide-react';
import {
  getProductById,
  getProductEditions,
  getProductDlc,
  getProducts,
  getProductReviews,
  normalizeImageUrl,
} from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { getSiteUrl } from '@/lib/site-url';
import { gamePath, platformSlug, isPlatformSegment } from '@/lib/product-url';
import { AddToCart } from '@/components/products/AddToCart';
import { ReviewForm } from '@/components/products/ReviewForm';
import { TrackView } from '@/components/products/TrackView';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { FitImage } from '@/components/ui/FitImage';
import { GameCover } from '@/components/products/GameCover';
import { BackButton } from '@/components/ui/BackButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const dynamic = 'force-dynamic';

interface Props {
  params: { platform: string; id: string };
}

const PLATFORM_LABEL: Record<string, string> = {
  ps: 'PlayStation',
  xbox: 'Xbox',
  steam: 'Steam',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProductById(Number(params.id));
    const imageUrl = normalizeImageUrl(product.image_url);
    const title = product.title;
    const desc =
      product.description?.replace(/<[^>]+>/g, ' ').slice(0, 160) ||
      `Купить ${title} для ${product.platform} в Беларуси. Цена: ${product.price_byn} BYN.`;

    // Каноничный адрес карточки. Без него товар, открытый из каталога с
    // фильтром или из поиска, выглядит для робота как отдельная страница
    // с тем же содержимым, и вес размазывается по дублям.
    //
    // Отдельный случай — версии одной игры для разных регионов. Турецкая и
    // украинская карточки различаются только ценой, но лежат по разным
    // адресам; таких пар в каталоге почти двадцать тысяч. canonical_id
    // приходит с сервера и указывает на украинскую — основную.
    //
    // Платформу в адрес берём из самого товара, а не из сегмента адреса:
    // так canonical не зависит от того, по какому платформенному пути
    // карточку открыли.
    const canonicalPath = gamePath(product.canonical_id ?? Number(params.id), product.platform);

    return {
      title,
      description: desc,
      alternates: { canonical: canonicalPath },
      openGraph: {
        url: canonicalPath,
        title: `${title} | GAME STORE`,
        description: desc,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Игра не найдена' };
  }
}

export default async function GamePage({ params }: Props) {
  // Платформа в адресе должна быть из известного списка. Прочее — 404,
  // иначе один товар доступен под бесконечным числом платформенных путей.
  if (!isPlatformSegment(params.platform)) notFound();

  const id = Number(params.id);
  if (!id || isNaN(id)) notFound();

  const region = getRegion();

  let product, editions, dlc;
  try {
    [product, editions, dlc] = await Promise.all([
      getProductById(id),
      getProductEditions(id, region),
      getProductDlc(id),
    ]);
  } catch (err) {
    // Настоящее «не найдено» — только при 404 от API.
    // Прочие сбои отдаём в error.tsx, а не маскируем под 404.
    if ((err as { status?: number }).status === 404) notFound();
    throw err;
  }

  // Отзывы покупателей (только одобренные) — для честной разметки Google.
  const reviews = await getProductReviews(id);

  // Похожие: тот же жанр, регион обязателен (иначе дубли), сортировка по рейтингу
  const mainGenre = product.genre?.split(',')[0]?.trim();
  const similar = await getProducts({
    genre: mainGenre || undefined,
    product_type: 'game',
    sort: 'rating',
    region,
    limit: 12,
  })
    .then((ps) => ps.filter((p) => p.id !== id).slice(0, 6))
    .catch(() => []);

  const imageUrl = normalizeImageUrl(product.image_url);
  const platforms = product.platform?.split(',').map((p) => p.trim()) ?? [];
  const cleanDescription = product.description?.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');

  // Считаем на запрос, а не на импорт: RAILWAY_PUBLIC_DOMAIN живёт в
  // окружении контейнера, на этапе сборки его ещё нет (см. lib/site-url.ts).
  const siteUrl = getSiteUrl();
  // Для версии другого региона ссылаемся на основную карточку — см. пояснение
  // в generateMetadata. Разметка и <link rel=canonical> должны совпадать,
  // иначе поисковик получает два противоречащих указания.
  const canonical = `${siteUrl}${gamePath(product.canonical_id ?? product.id, product.platform)}`;

  const platformSeg = platformSlug(product.platform);
  const platformLabel = PLATFORM_LABEL[platformSeg] ?? 'PlayStation';
  const platformListPath = `/games/${platformSeg}`;

  // Описание для разметки. Если своего описания у товара нет — подставляем
  // осмысленный запасной вариант, а не пустоту: Google для «данных о товарах
  // продавца» требует непустое поле description. Текст правдивый (название,
  // платформа, суть предложения), никакой накрутки.
  const ldDescription =
    cleanDescription && cleanDescription.trim().length > 0
      ? cleanDescription.trim()
      : `${product.title} для ${platformLabel} — цифровая игра для PlayStation. Быстрая доставка на аккаунт, оплата в BYN.`;

  // Разметка товара для поисковиков.
  //
  // aggregateRating и review добавляем ТОЛЬКО когда есть настоящие отзывы,
  // одобренные модератором (их отдаёт бэкенд, поле count). Никаких выдуманных
  // счётчиков: раньше здесь стоял `reviewCount: 10` из головы, а придуманные
  // отзывы в структурированных данных — прямое нарушение правил Google, за
  // которое наказывают весь сайт. Нет отзывов — нет и блока: это законно,
  // Google считает поля рекомендательными.
  const ratingLd =
    reviews.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviews.average,
            reviewCount: reviews.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.items.slice(0, 20).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author_name || 'Покупатель' },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            ...(r.text ? { reviewBody: r.text } : {}),
            ...(r.created_at ? { datePublished: r.created_at.slice(0, 10) } : {}),
          })),
        }
      : {};

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: ldDescription,
    image: imageUrl,
    sku: String(product.id),
    url: canonical,
    brand: { '@type': 'Brand', name: 'PlayStation' },
    ...(platforms.length ? { gamePlatform: platforms } : {}),
    ...ratingLd,
    offers: {
      '@type': 'Offer',
      url: canonical,
      price: product.price_byn,
      priceCurrency: 'BYN',
      availability: product.is_preorder
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'GAME STORE' },
    },
  };

  // Хлебные крошки: на странице они есть, но поисковик видит только разметку.
  // Из неё Google строит путь «gamesstore.by › Каталог › PlayStation › Игра»
  // в выдаче вместо голого адреса.
  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: platformLabel, item: `${siteUrl}${platformListPath}` },
      { '@type': 'ListItem', position: 4, name: product.title, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <TrackView product={product} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Возврат туда, откуда пришли: с карточки дополнения — обратно к
            изданиям игры, а не в общий каталог, куда ведут крошки. */}
        <div className="mb-4">
          <BackButton fallback={platformListPath} />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-text-primary">Главная</Link>
          <span>/</span>
          <Link href="/games" className="hover:text-text-primary">Каталог</Link>
          <span>/</span>
          <Link href={platformListPath} className="hover:text-text-primary">{platformLabel}</Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Cover */}
          <div className="relative">
            {/* 3:4 под вертикальные обложки PS Store. В квадрате у постера
                срезало верх с логотипом и низ с возрастным рейтингом. */}
            <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-xl overflow-hidden shadow-glow-card">
              {/* Обложка меняется вместе с выбранным изданием — см. GameCover. */}
              <GameCover productId={product.id} src={imageUrl} alt={product.title} />
              {product.discount_pct > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="accent">-{Math.round(product.discount_pct)}%</Badge>
                </div>
              )}
              {product.is_preorder && (
                <div className="absolute top-4 right-4">
                  <Badge variant="preorder">Предзаказ</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Platforms */}
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <Badge key={p} variant={p === 'PS5' ? 'ps5' : 'ps4'}>{p}</Badge>
              ))}
              {mainGenre && <Badge variant="outline">{mainGenre}</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              {product.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-text-primary font-medium">{product.rating.toFixed(1)}</span>
                  <span>/ 5.0</span>
                </div>
              )}
              {product.release_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(product.release_date).toLocaleDateString('ru-BY', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Monitor className="w-4 h-4" />
                <span>Каталог: {region === 'TR' ? 'Турция (TR)' : 'Украина (UA)'}</span>
              </div>
            </div>

            {/* Description */}
            {cleanDescription && (
              <p className="text-text-secondary leading-relaxed text-sm line-clamp-5 whitespace-pre-line">
                {cleanDescription}
              </p>
            )}

            {/* Add to cart */}
            <AddToCart product={product} editions={editions} region={region} />
          </div>
        </div>

        {/* DLC */}
        {dlc.length > 0 && (
          <ScrollReveal className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Дополнения (DLC)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dlc.slice(0, 12).map((item) => {
                // Клик ведёт только внутрь каталога. В PS Store не уводим
                // никогда: там та же игра стоит других денег. Дополнение без
                // своей карточки просто не кликается.
                const card = (
                  <>
                    {item.image_url && (
                      <FitImage
                        src={normalizeImageUrl(item.image_url)}
                        alt={item.title}
                        sizes="160px"
                        className="relative aspect-[3/4] rounded-lg mb-2"
                      />
                    )}
                    <p className="text-text-secondary text-xs line-clamp-2 mb-1">{item.title}</p>
                    {item.price_byn && (
                      <p className="text-text-primary text-xs font-semibold">{item.price_byn} BYN</p>
                    )}
                  </>
                );
                const base = 'bg-bg-card border border-border rounded-xl p-3 block';
                return item.linked_product_id ? (
                  <Link
                    key={item.id}
                    href={gamePath(item.linked_product_id, product.platform)}
                    className={`${base} transition-colors hover:border-accent/60`}
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={item.id} className={base}>
                    {card}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        )}

        {/* Отзывы: видимый блок под ту же разметку, что уходит в Google, + форма */}
        <ScrollReveal className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Отзывы об игре</h2>
            {reviews.count > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <span className="text-text-primary font-semibold">{reviews.average.toFixed(1)}</span>
                <span className="text-text-secondary text-sm">· {reviews.count}</span>
              </span>
            )}
          </div>

          {reviews.count > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {reviews.items.map((r) => (
                <div key={r.id} className="bg-bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-primary font-medium">{r.author_name}</span>
                    <span className="text-amber-400 text-sm tracking-wide">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.text && (
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{r.text}</p>
                  )}
                  {r.created_at && (
                    <p className="text-text-secondary/60 text-xs mt-2">
                      {new Date(r.created_at.replace(' ', 'T') + 'Z').toLocaleDateString('ru-BY', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm mb-6">
              Пока нет отзывов. Будьте первым, кто поделится мнением об игре.
            </p>
          )}

          <ReviewForm productId={product.id} />
        </ScrollReveal>

        {/* Similar */}
        {similar.length > 0 && (
          <ScrollReveal className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Похожие игры</h2>
              <Link href="/games" className="text-accent text-sm hover:underline">
                Весь каталог
              </Link>
            </div>
            <ProductGrid products={similar} />
          </ScrollReveal>
        )}
      </div>
    </>
  );
}
