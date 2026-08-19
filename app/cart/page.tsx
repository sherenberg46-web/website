'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { FitImage } from '@/components/ui/FitImage';
import { useCartStore } from '@/store/cartStore';
import { OrderForm } from '@/components/cart/OrderForm';
import { CartPromoBanner } from '@/components/cart/CartPromoBanner';
import { getTelegramLink } from '@/lib/api';
import { gamePath } from '@/lib/product-url';
import clsx from 'clsx';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  /**
   * Заказ только что оформлен.
   *
   * Нужен, потому что оформление опустошает корзину, а пустая корзина ниже
   * подменяет всё содержимое страницы экраном «Корзина пуста» — вместе с
   * формой и её подтверждением. Покупатель нажимал «Оформить заказ» и попадал
   * на пустую корзину без единого слова о том, что заказ принят: естественная
   * реакция — оформить ещё раз или уйти, решив, что сайт сломан.
   */
  const [ordered, setOrdered] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-border border-t-accent animate-spin mx-auto" />
      </div>
    );
  }

  if (items.length === 0 && !ordered) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-text-secondary mb-8">Добавьте игры из каталога</p>
        <Link
          href="/games"
          className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors inline-block"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Оформленный заказ прячет всё лишнее классом, а не условным
          рендером: убрать элемент из дерева — значит сдвинуть соседей, и React
          пересоздаст форму, потеряв вместе с ней экран подтверждения. */}
      <h1 className={clsx('text-3xl font-bold mb-8', ordered && 'hidden')}>Корзина</h1>

      <div className={clsx(ordered && 'hidden')}>
        <CartPromoBanner />
      </div>

      <div className={clsx('grid grid-cols-1 gap-6', ordered ? 'max-w-xl mx-auto' : 'lg:grid-cols-3')}>
        {/* Items */}
        <div className={clsx('lg:col-span-2 space-y-3', ordered && 'hidden')}>
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.edition_id}`}
              className="flex gap-4 bg-bg-card border border-border rounded-2xl p-4"
            >
              <FitImage
                src={item.image_url}
                alt={item.title}
                sizes="80px"
                backdrop={false}
                className="relative w-16 aspect-[3/4] rounded-xl shrink-0"
              />

              <div className="flex-1 min-w-0">
                <Link
                  href={gamePath(item.product_id)}
                  className="font-medium text-text-primary text-sm hover:text-accent transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
                {item.edition_name && (
                  <p className="text-text-secondary text-xs mt-0.5">{item.edition_name}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.product_id, item.edition_id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-text-primary">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product_id, item.edition_id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-text-primary text-sm">
                      {item.price_byn * item.qty} BYN
                    </span>
                    <button
                      onClick={() => removeItem(item.product_id, item.edition_id)}
                      className="text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order form */}
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <OrderForm onOrdered={() => setOrdered(true)} />

          <div className={clsx('mt-4 pt-4 border-t border-border', ordered && 'hidden')}>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-border text-text-secondary text-sm hover:border-accent/40 hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              Купить напрямую в Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
