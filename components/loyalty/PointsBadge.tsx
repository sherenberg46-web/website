'use client';

import { useState } from 'react';
import { Gift, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton';
import { pluralPoints, pointsForPrice, pointsToByn, useSiteLoyalty } from '@/lib/site-auth';

/**
 * Сколько бонусных баллов принесёт покупка: 1 балл за каждые 10 BYN.
 *
 * variant="card"  — компактная плашка на обложке карточки в каталоге;
 * variant="full"  — блок под ценой на странице товара: сумма в BYN, как это
 *                   работает и (для гостя) кнопка входа через Telegram.
 *
 * Товар дешевле 10 BYN баллов не даёт — тогда ничего не показываем.
 */
export function PointsBadge({
  price,
  variant,
  className,
}: {
  price: number | null | undefined;
  variant: 'card' | 'full';
  className?: string;
}) {
  const points = pointsForPrice(price);
  if (!points) return null;
  return variant === 'card' ? (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill bg-black/70 px-2 py-0.5 text-2xs font-bold text-accent backdrop-blur',
        className
      )}
      title={`+${points} ${pluralPoints(points)} за покупку`}
    >
      <Gift className="h-3 w-3" />+{points}
    </span>
  ) : (
    <FullBadge points={points} className={className} />
  );
}

function FullBadge({ points, className }: { points: number; className?: string }) {
  const { user } = useSiteLoyalty();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={clsx(
        'rounded-card border border-accent/30 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent p-3',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={open}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-gradient text-accent-contrast">
          <Gift className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-text-primary">
            +{points} {pluralPoints(points)} за покупку
          </span>
          <span className="block text-xs text-text-secondary">
            = {pointsToByn(points)} BYN на следующие заказы
            {!user && ' · нужен вход через Telegram'}
          </span>
        </span>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-text-secondary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-accent/15 pt-3 text-xs leading-relaxed text-text-secondary">
          <p>
            1 балл за каждые 10 BYN покупки · 10 баллов = 1 BYN · баллами можно оплатить до 25 %
            заказа · баллы не сгорают. Баланс общий с нашим Telegram-ботом.
          </p>
          {!user && (
            <>
              <p className="text-text-primary">
                Войдите через Telegram — и баллы начислятся после оплаты. Новым клиентам — 50
                стартовых баллов.
              </p>
              <TelegramLoginButton />
            </>
          )}
        </div>
      )}
    </div>
  );
}
