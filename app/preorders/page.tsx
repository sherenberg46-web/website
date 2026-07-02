import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Предзаказы',
  description: 'Предзаказы игр PlayStation — закажите игру до выхода по специальной цене.',
};

export const dynamic = 'force-dynamic';

export default async function PreordersPage() {
  const region = getRegion();
  // task_type=preorders — тот же фильтр, что в Mini App (is_preorder ловил лишнее)
  const products = await getProducts({ task_type: 'preorders', region, limit: 100 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-10">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
            Доступны для заказа
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Предзаказы</h1>
          <p className="text-text-secondary mt-3 max-w-md">
            Заказывайте игры до официального выхода. Код будет отправлен в день релиза.
          </p>
        </div>
      </ScrollReveal>
      <ProductGrid products={products} />
    </div>
  );
}
