'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import type { Product } from '@/lib/types';
import { getClientRegion } from '@/lib/region';
import { RegionBadge, type BadgeRegion } from '@/components/ui/RegionBadge';
import { TopupList } from './TopupList';

export interface TopupSection {
  code: BadgeRegion;
  title: string;
  note: string;
  currency: string;
  products: Product[];
}

interface Props {
  sections: TopupSection[];
}

/** Вкладки по регионам пополнения: UA / TR / PL / IN. */
export function TopupTabs({ sections }: Props) {
  const nonEmpty = sections.filter((s) => s.products.length > 0);
  const [active, setActive] = useState<BadgeRegion>(nonEmpty[0]?.code ?? 'UA');
  const reduceMotion = useReducedMotion();

  // Если в шапке выбрана Турция — открываем вкладку TR (после гидрации, чтобы не было рассинхрона)
  useEffect(() => {
    const r = getClientRegion();
    if (r === 'TR' && nonEmpty.some((s) => s.code === 'TR')) setActive('TR');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (nonEmpty.length === 0) {
    return (
      <p className="text-center text-text-secondary py-16">
        Карты пополнения временно недоступны. Загляните позже.
      </p>
    );
  }

  const current = nonEmpty.find((s) => s.code === active) ?? nonEmpty[0];

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Регион пополнения"
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {nonEmpty.map((s) => {
          const isActive = s.code === current.code;
          return (
            <button
              key={s.code}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(s.code)}
              className={clsx(
                'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors',
                isActive
                  ? 'text-black'
                  : 'text-text-secondary hover:text-text-primary bg-bg-card border border-border'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="topup-tab-pill"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 400, damping: 32 }
                  }
                  className="absolute inset-0 rounded-full bg-brand-gradient"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <RegionBadge code={s.code} />
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.code}
          role="tabpanel"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <p className="text-text-secondary text-sm text-center mb-6">{current.note}</p>
          <TopupList products={current.products} currency={current.currency} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
