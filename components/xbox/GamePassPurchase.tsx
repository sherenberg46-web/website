'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import {
  GAMEPASS_ACCOUNTS,
  GAMEPASS_IMAGE,
  GAMEPASS_IMAGE_WIDE,
  GAMEPASS_OFFERS,
  gamePassTitle,
  monthsWord,
  type GamePassAccount,
} from '@/lib/xbox';

/** Цена месяца «на мой аккаунт» — от неё считаем выгоду длинных сроков. */
const MONTH_PRICE =
  GAMEPASS_OFFERS.find((o) => o.account === 'own' && o.months === 1)?.price ?? 0;

/**
 * Покупка Game Pass Ultimate: способ выдачи → срок → в корзину.
 *
 * Сроки показываем только те, что есть у выбранного способа: у нового
 * аккаунта нет 11 месяцев, и пустая кнопка «нет в наличии» только путала бы.
 */
export function GamePassPurchase() {
  const addItem = useCartStore((s) => s.addItem);
  const [account, setAccount] = useState<GamePassAccount>('own');
  const [months, setMonths] = useState(12);
  const [added, setAdded] = useState(false);

  const offers = useMemo(
    () => GAMEPASS_OFFERS.filter((o) => o.account === account),
    [account]
  );
  const offer = offers.find((o) => o.months === months) ?? offers[offers.length - 1];

  function pickAccount(a: GamePassAccount) {
    setAccount(a);
    // Такого срока у другого способа может не быть — берём ближайший.
    const list = GAMEPASS_OFFERS.filter((o) => o.account === a);
    if (!list.some((o) => o.months === months)) {
      const nearest = list.reduce((best, o) =>
        Math.abs(o.months - months) < Math.abs(best.months - months) ? o : best
      );
      setMonths(nearest.months);
    }
  }

  function buy() {
    if (!offer.productId) return;
    addItem({
      product_id: offer.productId,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: gamePassTitle(offer),
      image_url: GAMEPASS_IMAGE,
      price_byn: offer.price,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const perMonth = Math.round(offer.price / offer.months);
  const saving =
    MONTH_PRICE > 0
      ? Math.round((1 - offer.price / (MONTH_PRICE * offer.months)) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Способ выдачи */}
      <div role="radiogroup" aria-label="Способ выдачи" className="grid gap-3 sm:grid-cols-2">
        {GAMEPASS_ACCOUNTS.map((a) => {
          const active = a.id === account;
          const from = Math.min(
            ...GAMEPASS_OFFERS.filter((o) => o.account === a.id).map((o) => o.price / o.months)
          );
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pickAccount(a.id)}
              className={clsx(
                'rounded-2xl border p-4 text-left transition-colors',
                active
                  ? 'border-[#107C10] bg-[#107C10]/10'
                  : 'border-border bg-bg-card hover:border-border-strong'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-text-primary">{a.label}</span>
                <span className="text-xs text-text-secondary">
                  от {Math.round(from)} BYN/мес
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{a.hint}</p>
            </button>
          );
        })}
      </div>

      {/* Срок */}
      <div>
        <p className="mb-2.5 text-sm font-semibold text-text-secondary">Срок подписки</p>
        <div role="radiogroup" aria-label="Срок подписки" className="flex flex-wrap gap-2">
          {offers.map((o) => {
            const active = o.months === offer.months;
            return (
              <button
                key={o.months}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMonths(o.months)}
                className={clsx(
                  'min-h-[44px] min-w-[4.5rem] rounded-control border px-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-[#107C10] bg-[#107C10] text-white'
                    : 'border-border bg-surface-2 text-text-secondary hover:text-text-primary'
                )}
              >
                {monthsWord(o.months)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Итог */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card sm:flex">
        <div className="relative aspect-[16/9] sm:aspect-auto sm:w-2/5">
          <Image
            src={GAMEPASS_IMAGE_WIDE}
            alt="Xbox Game Pass Ultimate"
            fill
            sizes="(max-width: 640px) 90vw, 360px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="text-sm font-semibold text-text-secondary">
            Game Pass Ultimate · {monthsWord(offer.months)}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight">{offer.price}</span>
            <span className="text-sm font-semibold text-text-secondary">BYN</span>
            {saving > 0 && (
              <span className="ml-2 rounded-full bg-[#107C10]/15 px-2 py-0.5 text-xs font-bold text-[#4CC24A]">
                −{saving}%
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-text-muted">
            ≈ {perMonth} BYN / мес
            {account === 'new' ? ' · новый аккаунт Microsoft' : ' · на ваш аккаунт Microsoft'}
          </div>

          <button
            type="button"
            onClick={buy}
            disabled={!offer.productId}
            className={clsx(
              'mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors',
              !offer.productId
                ? 'cursor-not-allowed bg-surface-2 text-text-muted'
                : added
                  ? 'bg-[#107C10]/20 text-[#4CC24A]'
                  : 'bg-[#107C10] text-white hover:bg-[#0E6B0E]'
            )}
          >
            {!offer.productId ? (
              'Скоро в продаже'
            ) : added ? (
              <>
                <Check className="h-4 w-4" /> В корзине
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Купить
              </>
            )}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            Оплата — после подтверждения заказа менеджером. Активация обычно 10–120 минут
            в рабочее время.
          </p>
        </div>
      </div>
    </div>
  );
}
