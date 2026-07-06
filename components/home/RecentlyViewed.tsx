'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getRecentlyViewed, type RecentItem } from '@/lib/recent';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/** «Вы смотрели» — история просмотров из браузера. Рендерится только если она есть. */
export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <ScrollReveal>
      <section>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Вы смотрели</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/games/${item.id}`}
              className="shrink-0 w-40 sm:w-48 snap-start group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-card border border-border group-hover:border-accent/40 transition-colors">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="192px"
                  quality={85}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.discount_pct > 0 && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-accent text-black text-[10px] font-bold rounded-md">
                    -{Math.round(item.discount_pct)}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-text-secondary group-hover:text-text-primary line-clamp-2 transition-colors">
                {item.title}
              </p>
              {item.price_byn != null && (
                <p className="text-xs font-semibold text-text-primary mt-0.5">{item.price_byn} BYN</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
