import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  priority?: boolean;
}

export function ProductGrid({ products, priority = false }: Props) {
  if (!products.length) {
    return (
      <div className="text-center py-20 text-text-secondary">
        <p className="text-lg">Ничего не найдено</p>
        <p className="text-sm mt-2">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={priority && i < 4} />
      ))}
    </div>
  );
}
