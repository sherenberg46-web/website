'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Props {
  title: string;
  products: Product[];
  viewAllHref?: string;
  accentTitle?: boolean;
  eyebrow?: string;
}

export function ProductCarousel({ title, products, viewAllHref, accentTitle, eyebrow }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === 'right' ? 1 : -1) * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // Перетаскивание мышью — карусель ощущается «живой»
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }
  function endDrag() {
    drag.current.active = false;
  }
  function onClickCapture(e: React.MouseEvent) {
    // Не открывать карточку, если это было перетаскивание
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  if (!products.length) return null;

  return (
    <ScrollReveal className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          {eyebrow && (
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-1">
              {eyebrow}
            </p>
          )}
          <h2
            className={clsx(
              'text-2xl md:text-3xl font-bold tracking-tight',
              accentTitle ? 'text-gradient' : 'text-text-primary'
            )}
          >
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-accent text-sm font-medium hover:underline shrink-0"
          >
            Все
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Scroll area with overlay arrows and edge fades */}
      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
        >
          {products.map((product, i) => (
            <div key={product.id} className="shrink-0 w-52 sm:w-64 md:w-72 snap-start">
              <ProductCard product={product} priority={i < 3} />
            </div>
          ))}
        </div>

        {/* Edge fades — приглашение к прокрутке */}
        {canLeft && (
          <div className="pointer-events-none absolute inset-y-0 -left-4 w-16 bg-gradient-to-r from-bg-page to-transparent hidden md:block" />
        )}
        {canRight && (
          <div className="pointer-events-none absolute inset-y-0 -right-4 w-16 bg-gradient-to-l from-bg-page to-transparent hidden md:block" />
        )}

        {/* Overlay arrows */}
        {canLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="Назад"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-11 h-11 rounded-full bg-bg-card/90 backdrop-blur border border-border shadow-xl items-center justify-center text-text-primary opacity-0 group-hover/carousel:opacity-100 hover:border-accent/50 hover:scale-105 transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="Вперёд"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-11 h-11 rounded-full bg-bg-card/90 backdrop-blur border border-border shadow-xl items-center justify-center text-text-primary opacity-0 group-hover/carousel:opacity-100 hover:border-accent/50 hover:scale-105 transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </ScrollReveal>
  );
}
