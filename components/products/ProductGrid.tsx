import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  priority?: boolean;
}

/**
 * Сетка карточек каталога.
 *
 * Framer Motion (whileInView + stagger) убран: на мобильном каталоге в 20+
 * карточек это давало десятки IntersectionObserver и заметный джанк, а
 * контент проявлялся с задержкой. Карточки рендерятся сразу; лёгкие
 * hover/active-эффекты — внутри ProductCard на CSS.
 */
export function ProductGrid({ products, priority = false }: Props) {
  if (!products.length) {
    return (
      <div className="py-20 text-center text-text-secondary">
        <p className="text-lg">Ничего не найдено</p>
        <p className="mt-2 text-sm">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-4 md:gap-y-8 xl:grid-cols-5">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={priority && i < 4} />
      ))}
    </div>
  );
}
