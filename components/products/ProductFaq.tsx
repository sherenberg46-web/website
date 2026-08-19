'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { FaqItem } from '@/lib/faq';

/**
 * Вопросы на карточке товара.
 *
 * Первый вопрос открыт сразу — про аккаунт спрашивают чаще всего, и держать
 * главный ответ за кликом значит не ответить вовсе.
 */
export function ProductFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-border">
      {items.map((item, i) => (
        <div key={item.q} className="border-b border-border">
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex items-center justify-between w-full py-4 text-left gap-4"
          >
            <span
              className={clsx(
                'font-medium transition-colors text-sm sm:text-base',
                open === i ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {item.q}
            </span>
            <ChevronDown
              className={clsx(
                'w-5 h-5 text-text-secondary shrink-0 transition-transform duration-300',
                open === i && 'rotate-180 text-accent'
              )}
            />
          </button>
          {open === i && (
            <p className="text-text-secondary text-sm leading-relaxed pb-4 pr-8">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
