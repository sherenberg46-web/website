'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { STEAM_IMAGE, STEAM_IMAGE_WIDE, STEAM_OFFERS, steamTitle } from '@/lib/steam';

/**
 * Покупка пополнения Steam: сумма → в корзину.
 *
 * Логин аккаунта здесь не спрашиваем: его просит форма заказа, как email
 * Microsoft у Game Pass, — одно место для данных аккаунта, а не два.
 */
export function SteamPurchase() {
  const addItem = useCartStore((s) => s.addItem);
  const [usd, setUsd] = useState(25);
  const [added, setAdded] = useState(false);

  const offer = STEAM_OFFERS.find((o) => o.usd === usd) ?? STEAM_OFFERS[0];

  function buy() {
    addItem({
      product_id: offer.productId,
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: steamTitle(offer.usd),
      image_url: STEAM_IMAGE,
      price_byn: offer.price,
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6">
      {/* Сумма */}
      <div>
        <p className="mb-2 text-sm font-semibold text-text-secondary sm:mb-2.5">
          Сумма пополнения
        </p>
        <div
          role="radiogroup"
          aria-label="Сумма пополнения"
          className="grid grid-cols-5 gap-2 sm:gap-3"
        >
          {STEAM_OFFERS.map((o) => {
            const active = o.usd === offer.usd;
            return (
              <button
                key={o.usd}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setUsd(o.usd)}
                className={clsx(
                  'flex min-h-[64px] flex-col items-center justify-center rounded-2xl border px-1 py-2 transition-colors sm:min-h-[76px]',
                  active
                    ? 'border-[#1B75BB] bg-[#1B75BB]/15'
                    : 'border-border bg-bg-card hover:border-border-strong'
                )}
              >
                <span className="text-base font-extrabold text-text-primary sm:text-xl">
                  ${o.usd}
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
                Пополнение кошелька Steam · ${offer.usd}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 sm:mt-2">
                <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {offer.price}
                </span>
                <span className="text-sm font-semibold text-text-secondary">BYN</span>
              </div>
              <div className="mt-0.5 text-xs text-text-muted sm:mt-1">
                на баланс Steam придёт ${offer.usd}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={buy}
            className={clsx(
              'mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition-colors sm:mt-6 sm:h-auto sm:rounded-lg sm:py-3 sm:text-sm',
              added
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
