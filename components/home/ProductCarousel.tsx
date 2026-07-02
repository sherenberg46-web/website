'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
  accentTitle?: boolean;
}

export function ProductCarousel({ title, products, viewAllHref, accentTitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  if (!products.length) return null;

  return (
    <ScrollReveal className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-2xl md:text-3xl font-bold tracking-tight ${
            accentTitle ? 'text-gradient' : 'text-text-primary'
          }`}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-accent text-sm font-medium hover:underline mr-2"
            >
              Все
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-border bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-border bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
      >
        {products.map((product, i) => (
          <div key={product.id} className="shrink-0 w-40 sm:w-48 md:w-52">
            <ProductCard product={product} priority={i < 3} />
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
