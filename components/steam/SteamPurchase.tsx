'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import {
  STEAM_IMAGE,
  STEAM_IMAGE_WIDE,
  STEAM_REGIONS,
  customEditionId,
  getSteamRegion,
  steamCustomPrice,
  steamMoney,
  steamTitle,
  type SteamRegionId,
} from '@/lib/steam';

/** «1500», «1 500», «1 500 ₽» → 1500; пусто или не число → null. */
function parseAmount(text: string): number | null {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

/**
 * Покупка пополнения Steam: регион кошелька → сумма → в корзину.
 *
 * Регион — валюта кошелька аккаунта Steam (СНГ в долларах, Россия, Казахстан,
 * Украина). У каждого свои границы суммы и свой курс.
 *
 * Сумма — любое целое число в границах региона; пять готовых сумм просто
 * подставляют значение в поле. Если введённая сумма совпала с готовой, в
 * корзину кладём готовый товар, иначе — товар «своя сумма» с суммой в
 * edition_id (цену считает сервер: клиентской не верим).
 *
 * Логин аккаунта здесь не спрашиваем: его просит форма заказа, как email
 * Microsoft у Game Pass, — одно место для данных аккаунта, а не два.
 */
export function SteamPurchase() {
  const addItem = useCartStore((s) => s.addItem);
  const [regionId, setRegionId] = useState<SteamRegionId>('cis');
  const [text, setText] = useState(String(getSteamRegion('cis').defaultAmount));
  const [added, setAdded] = useState(false);

  const region = getSteamRegion(regionId);
  const amount = parseAmount(text);
  const preset = amount === null ? undefined : region.offers.find((o) => o.amount === amount);
  const price = amount === null ? null : (preset?.price ?? steamCustomPrice(region, amount));
  const error =
    amount === null
      ? null
      : price === null
        ? amount < region.min
          ? `Минимальная сумма — ${steamMoney(region, region.min)}`
          : `Максимальная сумма — ${steamMoney(region, region.max)}`
        : null;

  function pickRegion(id: SteamRegionId) {
    setRegionId(id);
    // Границы и курс у регионов разные — начинаем с «средней» готовой суммы.
    setText(String(getSteamRegion(id).defaultAmount));
  }

  function buy() {
    if (amount === null || price === null) return;
    addItem({
      product_id: preset ? preset.productId : region.customProductId,
      edition_id: preset ? null : customEditionId(amount),
      edition_name: null,
      qty: 1,
      title: steamTitle({ region: region.id, amount }),
      image_url: STEAM_IMAGE,
      price_byn: price,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const canBuy = price !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      {/* Регион кошелька */}
      <div>
        <p className="mb-2 text-sm font-semibold text-text-secondary sm:mb-2.5">
          Регион аккаунта Steam
        </p>
        <div
          role="radiogroup"
          aria-label="Регион аккаунта Steam"
          className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface-1 p-1 sm:grid-cols-4"
        >
          {STEAM_REGIONS.map((r) => {
            const active = r.id === regionId;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => pickRegion(r.id)}
                className={clsx(
                  'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-bold transition-colors',
                  active ? 'bg-[#1B75BB] text-white' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {r.label}
                <span className={clsx('text-xs font-semibold', active ? 'text-white/75' : 'text-text-muted')}>
                  {r.currency}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Сумма: своя или готовая */}
      <div>
        <label
          htmlFor="steam-amount"
          className="mb-2 block text-sm font-semibold text-text-secondary sm:mb-2.5"
        >
          Сумма пополнения, {region.currency}
        </label>
        <input
          id="steam-amount"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^\d\s]/g, ''))}
          aria-invalid={!!error}
          aria-describedby="steam-amount-hint"
          placeholder={`От ${steamMoney(region, region.min)}`}
          className={clsx(
            'h-12 w-full rounded-xl border bg-surface-2 px-4 text-lg font-bold text-text-primary outline-none transition-colors placeholder:font-normal placeholder:text-text-muted',
            error ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-[#1B75BB]'
          )}
        />
        <p
          id="steam-amount-hint"
          className={clsx('mt-2 px-1 text-xs', error ? 'text-red-400' : 'text-text-muted')}
        >
          {error ??
            `От ${steamMoney(region, region.min)} до ${steamMoney(region, region.max)} за 24 часа на один логин`}
        </p>

        <div
          role="group"
          aria-label="Готовые суммы"
          className="mt-3 grid grid-cols-5 gap-2 sm:gap-3"
        >
          {region.offers.map((o) => {
            const active = o.amount === amount;
            return (
              <button
                key={o.productId}
                type="button"
                aria-pressed={active}
                onClick={() => setText(String(o.amount))}
                className={clsx(
                  'flex min-h-[56px] flex-col items-center justify-center rounded-2xl border px-1 py-2 transition-colors sm:min-h-[64px]',
                  active
                    ? 'border-[#1B75BB] bg-[#1B75BB]/15'
                    : 'border-border bg-bg-card hover:border-border-strong'
                )}
              >
                <span className="text-sm font-extrabold text-text-primary sm:text-base">
                  {steamMoney(region, o.amount)}
                </span>
                <span className="mt-0.5 text-[11px] text-text-muted sm:text-xs">{o.price} BYN</span>
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
            src={STEAM_IMAGE_WIDE}
            alt="Пополнение Steam"
            fill
            sizes="360px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Миниатюра — телефон */}
            <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded-lg sm:hidden">
              <Image src={STEAM_IMAGE} alt="Пополнение Steam" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text-secondary">
                Пополнение Steam · {region.label}
                {canBuy && amount !== null ? ` · ${steamMoney(region, amount)}` : ''}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 sm:mt-2">
                <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {price ?? '—'}
                </span>
                <span className="text-sm font-semibold text-text-secondary">BYN</span>
              </div>
              <div className="mt-0.5 text-xs text-text-muted sm:mt-1">
                {canBuy && amount !== null
                  ? `на баланс Steam придёт ${steamMoney(region, amount)}`
                  : 'Введите сумму или выберите готовую'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={buy}
            disabled={!canBuy}
            className={clsx(
              'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-colors sm:mt-6 sm:h-auto sm:rounded-lg sm:py-3 sm:text-sm',
              !canBuy
                ? 'cursor-not-allowed bg-surface-2 text-text-muted'
                : added
                  ? 'bg-[#1B75BB]/20 text-[#66C0F4]'
                  : 'bg-[#1B75BB] text-white hover:bg-[#16609A]'
            )}
          >
            {added ? (
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
            Логин Steam укажете при оформлении заказа. Оплата — после подтверждения заказа
            менеджером.
          </p>
        </div>
      </div>
    </div>
  );
}
