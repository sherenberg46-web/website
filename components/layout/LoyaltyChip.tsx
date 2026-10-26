'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Gift, LogOut, X } from 'lucide-react';
import { TelegramLoginButton } from '@/components/auth/TelegramLoginButton';
import { logout, pluralPoints, pointsToByn, useSiteLoyalty } from '@/lib/site-auth';

/**
 * Баллы в шапке. Не вошёл — кнопка «Войти», вошёл — баланс.
 * По нажатию — окно: вход через Telegram или подробности баланса и «Выйти».
 */
export function LoyaltyChip() {
  const { user, loyalty } = useSiteLoyalty();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Закрытие по Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-11 min-w-11 min-[360px]:flex items-center justify-center gap-1 rounded-control px-1.5 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:px-2.5"
        title={user ? 'Мои баллы' : 'Войти через Telegram'}
      >
        <Gift className="h-[18px] w-[18px] shrink-0 text-accent" />
        {/* Узкий экран: у гостя — только значок, а уже 360 px кнопку прячем
            совсем (вход остаётся в корзине) — иначе корзина уезжает за край */}
        <span
          className={
            user ? 'text-xs font-bold text-text-primary' : 'hidden text-xs font-bold text-text-primary sm:inline'
          }
        >
          {user ? (loyalty ? loyalty.balance : '…') : 'Войти'}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-sm rounded-t-card border border-border bg-surface-1 p-5 pb-8 sm:rounded-card sm:pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-control text-text-secondary hover:bg-white/5"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>

              {!user ? (
                <>
                  <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
                    <Gift className="h-5 w-5 text-accent" /> Баллы за покупки
                  </h2>
                  <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                    Войдите через Telegram — и баллы будут общими с нашим ботом. 1 балл за
                    каждые 10 BYN, баллами можно оплатить до 25 % заказа. Новым клиентам —
                    50 стартовых баллов.
                  </p>
                  <TelegramLoginButton onDone={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <h2 className="mb-1 text-lg font-bold">
                    {user.first_name || (user.username ? `@${user.username}` : 'Мои баллы')}
                  </h2>
                  {loyalty ? (
                    <>
                      <p className="mb-3 text-3xl font-extrabold tracking-tight">
                        {loyalty.balance}{' '}
                        <span className="text-sm font-semibold text-text-secondary">
                          {pluralPoints(loyalty.balance)} ={' '}
                          {pointsToByn(loyalty.balance, loyalty.points_per_byn)} BYN
                        </span>
                      </p>
                      {loyalty.welcome_left > 0 && (
                        <p className="mb-2 text-sm text-text-secondary">
                          Из них {loyalty.welcome_left} {pluralPoints(loyalty.welcome_left)} —
                          стартовый бонус, его можно потратить в заказе от{' '}
                          {loyalty.welcome_min_order_byn} BYN
                        </p>
                      )}
                      <p className="mb-4 text-xs leading-relaxed text-text-secondary">
                        1 балл за каждые {loyalty.earn_step_byn} BYN покупки ·{' '}
                        {loyalty.points_per_byn} баллов = 1 BYN · баллами можно оплатить до{' '}
                        {Math.round(loyalty.max_spend_share * 100)} % заказа. Баланс общий с
                        Telegram-ботом.
                      </p>
                    </>
                  ) : (
                    <p className="mb-4 text-sm text-text-secondary">Загружаем баланс…</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
                  >
                    <LogOut className="h-4 w-4" /> Выйти
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
