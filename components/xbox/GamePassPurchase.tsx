'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ShoppingCart } from 'lucide-react';
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

/** Самая низкая цена месяца у способа выдачи — для подписи «от N BYN/мес». */
function fromPerMonth(a: GamePassAccount): number {
  return Math.round(
    Math.min(...GAMEPASS_OFFERS.filter((o) => o.account === a).map((o) => o.price / o.months))
  );
}

/**
 * Покупка Game Pass Ultimate: способ выдачи → срок → в корзину.
 *
 * Сроки показываем только те, что есть у выбранного способа: у нового
 * аккаунта нет 11 месяцев, и пустая кнопка «нет в наличии» только путала бы.
 *
 * На телефоне всё собрано плотнее: способ выдачи — переключатель в одну
 * строку, срок — выпадающий список с ценой в каждом пункте, вместо широкой
 * картинки — миниатюра обложки. Двенадцать кнопок-сроков занимали три ряда,
 * и цена с кнопкой «Купить» уезжали за экран.
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
  const accountInfo = GAMEPASS_ACCOUNTS.find((a) => a.id === account)!;

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
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      {/* Способ выдачи — телефон: переключатель в одну строку */}
      <div className="sm:hidden">
        <div
          role="radiogroup"
          aria-label="Способ выдачи"
          className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface-1 p-1"
        >
          {GAMEPASS_ACCOUNTS.map((a) => {
            const active = a.id === account;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => pickAccount(a.id)}
                className={clsx(
                  'flex flex-col items-center rounded-xl px-2 py-2.5 transition-colors',
                  active ? 'bg-[#107C10] text-white' : 'text-text-secondary'
                )}
              >
                <span className="text-sm font-bold">{a.label}</span>
                <span className={clsx('text-[11px]', active ? 'text-white/75' : 'text-text-muted')}>
                  от {fromPerMonth(a.id)} BYN/мес
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-xs leading-relaxed text-text-secondary">{accountInfo.hint}</p>
      </div>

      {/* Способ выдачи — десктоп: карточки с пояснением */}
      <div role="radiogroup" aria-label="Способ выдачи" className="hidden gap-3 sm:grid sm:grid-cols-2">
        {GAMEPASS_ACCOUNTS.map((a) => {
          const active = a.id === account;
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
                <span className="text-xs text-text-secondary">от {fromPerMonth(a.id)} BYN/мес</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{a.hint}</p>
            </button>
          );
        })}
      </div>

      {/* Срок */}
      <div>
        <label
          htmlFor="gp-months"
          className="mb-2 block text-sm font-semibold text-text-secondary sm:mb-2.5"
        >
          Срок подписки
        </label>

        {/* Телефон: выпадающий список, цена прямо в пункте */}
        <div className="relative sm:hidden">
          <select
            id="gp-months"
            value={offer.months}
            onChange={(e) => setMonths(Number(e.target.value))}
            style={{ colorScheme: 'dark' }}
            className="h-12 w-full appearance-none rounded-xl border border-border bg-surface-2 pl-4 pr-11 text-[15px] font-semibold text-text-primary outline-none transition-colors focus:border-[#107C10]"
          >
            {offers.map((o) => (
              <option key={o.months} value={o.months}>
                {monthsWord(o.months)} — {o.price} BYN
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        </div>

        {/* Десктоп: кнопки-сроки */}
        <div role="radiogroup" aria-label="Срок подписки" className="hidden flex-wrap gap-2 sm:flex">
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
        {/* Широкая обложка — только десктоп */}
        <div className="relative hidden sm:block sm:w-2/5">
          <Image
            src={GAMEPASS_IMAGE_WIDE}
            alt="Xbox Game Pass Ultimate"
            fill
            sizes="360px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Миниатюра — телефон */}
            <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-lg sm:hidden">
              <Image
                src={GAMEPASS_IMAGE}
                alt="Xbox Game Pass Ultimate"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-secondary">
                Game Pass Ultimate · {monthsWord(offer.months)}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 sm:mt-2">
                <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {offer.price}
                </span>
                <span className="text-sm font-semibold text-text-secondary">BYN</span>
                {saving > 0 && (
                  <span className="ml-1 rounded-full bg-[#107C10]/15 px-2 py-0.5 text-xs font-bold text-[#4CC24A]">
                    −{saving}%
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-text-muted sm:mt-1">
                ≈ {perMonth} BYN / мес
                <span className="hidden sm:inline">
                  {account === 'new' ? ' · новый аккаунт Microsoft' : ' · на ваш аккаунт Microsoft'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={buy}
            disabled={!offer.productId}
            className={clsx(
              'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-colors sm:mt-6 sm:h-auto sm:rounded-lg sm:py-3 sm:text-sm',
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
          <p className="mt-3 text-center text-xs leading-relaxed text-text-muted sm:text-left">
            Оплата — после подтверждения заказа менеджером. Активация обычно 10–120 минут
            в рабочее время.
          </p>
        </div>
      </div>
    </div>
  );
}
