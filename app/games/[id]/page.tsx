import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Calendar, Monitor, Tag } from 'lucide-react';
import {
  getProductById,
  getProductEditions,
  getProductDlc,
  getProducts,
  normalizeImageUrl,
} from '@/lib/api';
import { AddToCart } from '@/components/products/AddToCart';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const revalidate = 300;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProductById(Number(params.id));
    const imageUrl = normalizeImageUrl(product.image_url);
    const title = product.title;
    const desc =
      product.description?.slice(0, 160) ||
      `Купить ${title} для ${product.platform} в Беларуси. Цена: ${product.price_byn} BYN.`;

    return {
      title,
      description: desc,
      openGraph: {
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
  const id = Number(params.id);
  if (!id || isNaN(id)) notFound();

  let product, editions, dlc;
  try {
    [product, editions, dlc] = await Promise.all([
      getProductById(id),
      getProductEditions(id),
      getProductDlc(id),
    ]);
  } catch {
    notFound();
  }

  const similar = await getProducts({
    genre: product.genre ?? undefined,
    category_id: product.category_id,
    limit: 6,
  }).then((ps) => ps.filter((p) => p.id !== id).slice(0, 5)).catch(() => []);

  const imageUrl = normalizeImageUrl(product.image_url);
  const platforms = product.platform?.split(',').map((p) => p.trim()) ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: imageUrl,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: 'PlayStation' },
    offers: {
      '@type': 'Offer',
      price: product.price_byn,
      priceCurrency: 'BYN',
      availability: product.is_preorder
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'GAME STORE' },
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: 10,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-text-primary">Главная</Link>
          <span>/</span>
          <Link href="/games" className="hover:text-text-primary">Каталог</Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Cover */}
          <div className="relative">
            <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-glow-card">
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 40vw"
              />
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
              {product.genre && (
                <Badge variant="outline">{product.genre.split(',')[0].trim()}</Badge>
              )}
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
              {product.region && (
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  <span>Регион: {product.region}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-text-secondary leading-relaxed text-sm line-clamp-5">
                {product.description}
              </p>
            )}

            {/* Add to cart */}
            <AddToCart product={product} editions={editions} />
          </div>
        </div>

        {/* DLC */}
        {dlc.length > 0 && (
          <ScrollReveal className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Дополнения (DLC)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dlc.slice(0, 12).map((item) => (
                <div key={item.id} className="bg-bg-card border border-border rounded-xl p-3">
                  {item.image_url && (
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <Image
                        src={normalizeImageUrl(item.image_url)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                  )}
                  <p className="text-text-secondary text-xs line-clamp-2 mb-1">{item.title}</p>
                  {item.price_byn && (
                    <p className="text-text-primary text-xs font-semibold">{item.price_byn} BYN</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

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
