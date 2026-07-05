'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  priority?: boolean;
}

export function ProductGrid({ products, priority = false }: Props) {
  const reduceMotion = useReducedMotion();

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
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{
            duration: 0.45,
            delay: reduceMotion ? 0 : Math.min(i * 0.05, 0.4),
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <ProductCard product={product} priority={priority && i < 4} />
        </motion.div>
      ))}
    </div>
  );
}
