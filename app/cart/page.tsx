'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { FitImage } from '@/components/ui/FitImage';
import { useCartStore } from '@/store/cartStore';
import { OrderForm } from '@/components/cart/OrderForm';
import { CartPromoBanner } from '@/components/cart/CartPromoBanner';
import {
  getProductById,
  getProductEditionsStrict,
  getTelegramLink,
  normalizeImageUrl,
} from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import type { CartItemFresh } from '@/store/cartStore';
import type { CatalogEdition, Product } from '@/lib/types';
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

  const syncFromServer = useCartStore((s) => s.syncFromServer);
  /** Что изменилось с прошлого визита: подорожало, подешевело, пропало. */
  const [notices, setNotices] = useState<string[]>([]);
  const syncedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  /**
   * Сверка корзины с сервером при открытии страницы.
   *
   * Корзина хранит цену снимком в localStorage — иначе её нечем показать
   * сразу. Но снимок стареет: товар, добавленный до конца распродажи, лежал
   * со старой ценой, покупатель видел её в итоге, а заказ считался по
   * текущей. Разницу обнаруживал уже менеджер в переписке.
   *
   * Сверяем один раз за открытие страницы. Что не удалось проверить —
   * оставляем как есть: лучше показать старую цену, чем вычистить корзину
   * из-за обрыва связи.
   */
  useEffect(() => {
    if (!mounted || syncedRef.current) return;
    const snapshot = useCartStore.getState().items;
    if (snapshot.length === 0) return;
    syncedRef.current = true;

    let alive = true;
    (async () => {
      const region = getClientRegion();

      // Издания берём тем же списком, что показывает карточка игры: цены в
      // нём уже сверены с каталогом. Один запрос на товар, а не на позицию.
      const parents = Array.from(
        new Set(snapshot.filter((i) => i.edition_id != null).map((i) => i.product_id))
      );
      const plain = Array.from(
        new Set(snapshot.filter((i) => i.edition_id == null).map((i) => i.product_id))
      );

      // null = проверить не удалось, 'gone' = сервер ответил «нет такого».
      const edLists = new Map<number, CatalogEdition[] | null>();
      const products = new Map<number, Product | 'gone' | null>();

      await Promise.all([
        ...parents.map(async (pid) => {
          try {
            edLists.set(pid, await getProductEditionsStrict(pid, region));
          } catch {
            edLists.set(pid, null);
          }
        }),
        ...plain.map(async (pid) => {
          try {
            products.set(pid, await getProductById(pid));
          } catch (e: unknown) {
            products.set(pid, (e as { status?: number }).status === 404 ? 'gone' : null);
          }
        }),
      ]);

      const fresh: CartItemFresh[] = [];
      const msgs: string[] = [];

      for (const item of snapshot) {
        let patch: CartItemFresh | null = null;

        if (item.edition_id != null) {
          const list = edLists.get(item.product_id);
          if (!list) continue; // не проверили — не трогаем
          const ed = list.find((e) => e.id === item.edition_id);
          if (!ed) {
            patch = { product_id: item.product_id, edition_id: item.edition_id, price_byn: null };
          } else {
            const raw = region === 'TR' ? ed.price_byn_tr : ed.price_byn;
            const price = raw && raw > 0 ? raw : null;
            patch = {
              product_id: item.product_id,
              edition_id: item.edition_id,
              price_byn: price,
              discount_pct: ed.discount_pct,
              original_price_byn:
                price && ed.discount_pct > 0
                  ? Math.round((price * 100) / (100 - ed.discount_pct))
                  : null,
              edition_name: ed.edition_name ?? item.edition_name,
            };
          }
        } else {
          const prod = products.get(item.product_id);
          if (prod === null || prod === undefined) continue; // не проверили
          if (prod === 'gone') {
            patch = { product_id: item.product_id, edition_id: null, price_byn: null };
          } else {
            const raw = region === 'TR' ? prod.price_byn_tr ?? prod.price_byn : prod.price_byn;
            const price = raw && raw > 0 ? raw : null;
            patch = {
              product_id: item.product_id,
              edition_id: null,
              price_byn: price,
              discount_pct: prod.discount_pct,
              original_price_byn:
                price && prod.discount_pct > 0
                  ? Math.round((price * 100) / (100 - prod.discount_pct))
                  : null,
              title: prod.title,
              image_url: normalizeImageUrl(prod.image_url),
            };
          }
        }

        if (!patch) continue;
        fresh.push(patch);

        const name = item.edition_name ? `${item.title} (${item.edition_name})` : item.title;
        if (patch.price_byn == null) {
          msgs.push(`«${name}» больше не продаётся — убрали из корзины`);
        } else if (patch.price_byn > item.price_byn) {
          msgs.push(`«${name}» подорожал: было ${item.price_byn} BYN, стало ${patch.price_byn} BYN`);
        } else if (patch.price_byn < item.price_byn) {
          msgs.push(`«${name}» подешевел: было ${item.price_byn} BYN, стало ${patch.price_byn} BYN`);
        }
      }

      if (!alive) return;
      if (fresh.length) syncFromServer(fresh);
      setNotices(msgs);
    })();

    return () => {
      alive = false;
    };
  }, [mounted, syncFromServer]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (items.length === 0 && !ordered) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-card bg-surface-1 text-text-secondary">
          <ShoppingCart className="h-7 w-7" />
        </div>
        <h1 className="mb-1.5 text-xl font-bold">Корзина пуста</h1>
        <p className="mb-6 text-sm text-text-secondary">Добавьте игры из каталога</p>
        <Link href="/games" className="btn btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  // Итоги по корзине — по проверенным данным стора. Промокод применяется
  // отдельно в форме (там своя, серверная, арифметика), поэтому здесь
  // показываем стоимость игр до промокода.
  const itemsFullTotal = items.reduce(
    (s, i) => s + (i.original_price_byn ?? i.price_byn) * i.qty,
    0
  );
  const itemsTotal = Math.ceil(totalPrice);
  const itemsDiscount = Math.max(0, Math.round(itemsFullTotal) - itemsTotal);

  return (
    <div
      className={clsx(
        'mx-auto max-w-5xl px-4 pt-8',
        // Место под мобильную закреплённую панель оформления (см. OrderForm).
        ordered ? 'pb-10' : 'pb-[6.5rem] md:pb-10'
      )}
    >
      <h1 className={clsx('mb-6 text-2xl font-bold md:text-3xl', ordered && 'hidden')}>
        Корзина
      </h1>

      <div className={clsx(ordered && 'hidden')}>
        <CartPromoBanner />
      </div>

      <div
        className={clsx('grid gap-6', ordered ? 'mx-auto max-w-xl' : 'lg:grid-cols-3 lg:items-start')}
      >
        {/* Товары + итоги */}
        <div className={clsx('space-y-4 lg:col-span-2', ordered && 'hidden')}>
          {notices.length > 0 && (
            <div className="space-y-1 rounded-card border border-accent/30 bg-surface-1 p-4">
              <p className="text-sm font-semibold text-text-primary">Корзина обновлена</p>
              {notices.map((n) => (
                <p key={n} className="text-xs text-text-secondary">
                  {n}
                </p>
              ))}
            </div>
          )}

          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.edition_id}`}
              className="flex gap-3 rounded-card border border-border bg-surface-1 p-3"
            >
              <Link href={gamePath(item.product_id)} className="shrink-0">
                <FitImage
                  src={item.image_url}
                  alt={item.title}
                  sizes="72px"
                  backdrop={false}
                  className="relative aspect-[3/4] w-14 rounded-control"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={gamePath(item.product_id)}
                  className="line-clamp-2 text-sm font-medium text-text-primary transition-colors hover:text-accent"
                >
                  {item.title}
                </Link>
                {item.edition_name && (
                  <p className="mt-0.5 text-xs text-text-secondary">{item.edition_name}</p>
                )}

                <p className="mt-1.5 text-sm font-bold text-text-primary">
                  {item.price_byn * item.qty} BYN
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-control border border-border">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, item.edition_id, item.qty - 1)}
                      aria-label="Уменьшить количество"
                      className="tap-target grid place-items-center text-text-secondary transition-colors hover:text-text-primary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span
                      className="w-7 text-center text-sm font-medium text-text-primary"
                      aria-live="polite"
                    >
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, item.edition_id, item.qty + 1)}
                      aria-label="Увеличить количество"
                      className="tap-target grid place-items-center text-text-secondary transition-colors hover:text-text-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id, item.edition_id)}
                    aria-label={`Удалить «${item.title}» из корзины`}
                    className="tap-target grid place-items-center text-text-secondary transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Итоги по корзине */}
          <div className="space-y-2 rounded-card border border-border bg-surface-1 p-4 text-sm">
            {itemsDiscount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Товары</span>
                  <span className="text-text-secondary line-through">
                    {Math.round(itemsFullTotal)} BYN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Скидка</span>
                  <span className="text-accent">−{itemsDiscount} BYN</span>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <span className="font-medium text-text-primary">Итого</span>
              <span className="text-lg font-extrabold tracking-tight text-text-primary">
                {itemsTotal} BYN
              </span>
            </div>
          </div>
        </div>

        {/* Оформление */}
        <div className="rounded-card border border-border bg-surface-1 p-5 lg:sticky lg:top-24 lg:self-start">
          <OrderForm onOrdered={() => setOrdered(true)} />

          {!ordered && (
            <p className="mt-4 border-t border-border pt-4 text-center text-xs text-text-secondary">
              Не хотите оформлять здесь?{' '}
              <a
                href={getTelegramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Написать менеджеру в Telegram
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
