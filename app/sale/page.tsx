import type { Metadata } from 'next';
import { getProducts, getSaleCollections } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Распродажа',
  description: 'Лучшие скидки на цифровые игры PlayStation. Успейте купить по выгодным ценам.',
};

export const dynamic = 'force-dynamic';

export default async function SalePage() {
  const region = getRegion();
  const [products, saleCollections] = await Promise.all([
    // task_type=sales — серверный фильтр акций, как в Mini App:
    // только игры с активной скидкой в выбранном регионе
    getProducts({ task_type: 'sales', sort: 'discount', region, limit: 40 }),
    getSaleCollections(),
  ]);

  const withDiscount = products.filter((p) => p.discount_pct > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Специальные предложения
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Распродажа</h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Скидки до 90% на лучшие игры PlayStation. Предложения ограничены по времени.
          </p>
        </div>
      </ScrollReveal>

      {/* Sale collections */}
      {saleCollections.length > 0 && (
        <ScrollReveal className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {saleCollections.map((sc) => (
              <Link
                key={sc.id}
                href={`/sale/${sc.path}`}
                className="bg-bg-card border border-border rounded-2xl p-4 hover:border-accent/40 transition-colors group"
              >
                <p className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">
                  {sc.title}
                </p>
                {sc.description && (
                  <p className="text-text-secondary text-xs mt-1 line-clamp-2">{sc.description}</p>
                )}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Products */}
      <ScrollReveal>
        {withDiscount.length > 0 ? (
          <ProductGrid products={withDiscount} />
        ) : (
          <ProductGrid products={products} />
        )}
      </ScrollReveal>
    </div>
  );
}
