'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ShoppingCart, Check, Heart, ExternalLink, ShieldCheck, Clock, CreditCard, Globe } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { useEditionStore } from '@/store/editionStore';
import { normalizeImageUrl, getTelegramLink, getOriginalPrice } from '@/lib/api';
import { fbTrack } from '@/lib/fbq';
import type { Product, CatalogEdition } from '@/lib/types';
import type { Region } from '@/lib/region';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { FitImage } from '@/components/ui/FitImage';

interface Props {
  product: Product;
  editions: CatalogEdition[];
  region: Region;
}

function editionPrice(ed: CatalogEdition, region: Region): number | null {
  const p = region === 'TR' ? ed.price_byn_tr : ed.price_byn;
  return p && p > 0 ? p : null;
}

/**
 * Можно ли показывать цену издания и давать его выбрать.
 *
 * Цена считается годной, только если сервер сумел сверить её с живым товаром
 * в каталоге либо администратор пометил её проверенной. Иначе это снимок из
 * game_editions, снятый при первом сканировании и с тех пор не обновлявшийся.
 * Такие цены годами расходились с действительностью: у Mortal Kombat 1 в
 * списке стояли 36 BYN с распродажи двухлетней давности.
 *
 * Поле необязательное: если бэкенд его не прислал (старая версия), ведём себя
 * как раньше и цену показываем.
 */
function isPriceUsable(ed: CatalogEdition): boolean {
  return ed.is_free || ed.price_confirmed !== false;
}

export function AddToCart({ product, editions, region }: Props) {
  // По умолчанию выбираем издание, которое и есть этот товар. Если такой связи
  // нет — не выбираем НИЧЕГО и показываем цену самого товара.
  //
  // Раньше в этом случае подставлялось первое издание, и страница показывала
  // его цену. Но цены изданий протухают: скидка применяется к товару, а
  // game_editions остаются с доскидочной ценой (1550 товаров в каталоге, и у
  // 1535 из них есть скидка). Mortal Kombat 1: товар 36 BYN со скидкой 80 %,
  // а Standard Edition в базе всё ещё 156. Покупатель видел 156 на странице,
  // 36 в каталоге и 36 в корзине.
  //
  // price_byn товара — то, что показывает каталог и по чему считается заказ,
  // поэтому по умолчанию доверяем ему.
  const defaultIdx = editions.findIndex((e) => e.linked_product_id === product.id);
  const [idx, setIdx] = useState(defaultIdx);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const selectEdition = useEditionStore((s) => s.select);

  // Стор избранного и корзина живут в localStorage: на сервере они пусты,
  // на клиенте регидратируются. Состояние, зависящее от них (иконка ♥,
  // ярлык «В корзине»), читаем только после монтирования — иначе рассинхрон
  // гидратации. Тот же приём, что в шапке и ProductCard.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isFav = mounted && isFavourite(product.id);

  // Выбор издания меняет и обложку вверху страницы: у Deluxe и Ultimate в
  // PS Store своё оформление, и покупатель должен видеть то, что берёт.
  function pick(i: number, ed: CatalogEdition) {
    if (!isPriceUsable(ed)) return;
    setIdx(i);
    selectEdition(product.id, ed.image_url ?? null);
  }

  // idx = -1 означает «издание не выбрано» → берём цену самого товара.
  // Издание с неподтверждённой ценой выбранным не считается даже случайно:
  // иначе его цена уйдёт в корзину и в заказ.
  const picked = idx >= 0 ? editions[idx] ?? null : null;
  const selected = picked && isPriceUsable(picked) ? picked : null;
  const productPrice =
    region === 'TR' ? product.price_byn_tr ?? product.price_byn : product.price_byn;
  const price = selected ? editionPrice(selected, region) ?? productPrice : productPrice;
  const discount = selected?.discount_pct ?? product.discount_pct;
  // Старая цена — существующей формулой (getOriginalPrice), новую логику не вводим.
  const oldPrice = discount > 0 && price != null ? getOriginalPrice(price, discount) : null;
  // Уже в корзине — читаем фактическое состояние корзины, а не новый флаг.
  const inCart =
    mounted &&
    cartItems.some(
      (i) => i.product_id === product.id && i.edition_id === (selected?.id ?? null)
    );

  // Просмотр карточки товара для пикселя Meta.
  //
  // Шлём один раз на товар и берём цену самого товара, а не выбранного
  // издания: смена издания не открывает новую карточку, и повторные события
  // только размывали бы статистику.
  useEffect(() => {
    fbTrack('ViewContent', {
      content_ids: [String(product.id)],
      content_type: 'product',
      content_name: product.title,
      value: productPrice ?? undefined,
      currency: 'BYN',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Высота мобильной sticky-панели покупки — чтобы Chat FAB встал над ней
  // (см. SupportChat). На десктопе панель скрыта; переменная там безвредна,
  // FAB использует свой фиксированный отступ.
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty('--pdp-cta-h', '4.25rem');
    return () => {
      el.style.removeProperty('--pdp-cta-h');
    };
  }, []);

  // Сравнение цен по регионам (обе есть в базе)
  const uaPrice = product.price_byn;
  const trPrice = product.price_byn_tr;
  const showCompare =
    product.product_type === 'game' && uaPrice != null && trPrice != null && uaPrice !== trPrice;
  const cheaper: Region = (uaPrice ?? Infinity) <= (trPrice ?? Infinity) ? 'UA' : 'TR';

  // Насколько издание дороже самого дешёвого из доступных.
  //
  // «Ultimate Edition — 386 BYN» рядом со «Standard — 314 BYN» не отвечает на
  // вопрос, который покупатель задаёт себе на самом деле: сколько стоит
  // доплата. Разницу он считает в уме, и часто просто не считает.
  const usablePrices = editions
    .filter(isPriceUsable)
    .map((e) => editionPrice(e, region))
    .filter((p): p is number => p != null && p > 0);
  const minEditionPrice = usablePrices.length ? Math.min(...usablePrices) : null;

  // Дата выхода человеческим языком — её же показывает шапка карточки.
  const releaseLabel = product.release_date
    ? new Date(product.release_date).toLocaleDateString('ru-BY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  function handleAdd() {
    if (!price) return;
    addItem({
      product_id: product.id,
      edition_id: selected?.id ?? null,
      edition_name: selected?.edition_name ?? null,
      qty: 1,
      title: product.title,
      image_url: normalizeImageUrl(product.image_url),
      price_byn: price,
      original_price_byn:
        discount > 0 ? Math.round((price * 100) / (100 - discount)) : null,
      discount_pct: discount,
      product_type: product.product_type,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    fbTrack('AddToCart', {
      content_ids: [String(product.id)],
      content_type: 'product',
      content_name: product.title,
      value: price,
      currency: 'BYN',
    });
  }

  return (
    <div className="space-y-4">
      {/* Edition selector */}
      {editions.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-text-secondary font-medium">Издание:</p>
          <div className="grid grid-cols-1 gap-2">
            {editions.map((ed, i) => {
              const p = editionPrice(ed, region);
              const usable = isPriceUsable(ed);
              const active = i === idx && usable;
              return (
                <button
                  key={ed.id}
                  onClick={() => pick(i, ed)}
                  disabled={!usable}
                  title={usable ? undefined : 'Цена уточняется — издание временно недоступно'}
                  className={clsx(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border text-sm transition-all text-left',
                    !usable
                      ? 'border-border bg-bg-card text-text-secondary opacity-60 cursor-default'
                      : active
                        ? 'border-accent/60 bg-accent/10 text-text-primary'
                        : 'border-border bg-bg-card text-text-secondary hover:border-border/80 hover:text-text-primary'
                  )}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {/* Миниатюра издания: у Deluxe и Ultimate обложки разные,
                        по ним выбор считывается быстрее, чем по названию. */}
                    {ed.image_url && (
                      <FitImage
                        src={normalizeImageUrl(ed.image_url)}
                        alt=""
                        sizes="56px"
                        backdrop={false}
                        className="relative w-14 h-14 rounded-lg shrink-0"
                      />
                    )}
                    {/* Короткое имя читается лучше полного: название игры и так
                        стоит над списком. */}
                    <span className="font-medium truncate">
                      {ed.edition_label || ed.edition_name}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {usable && ed.discount_pct > 0 && (
                      <span className="text-[10px] font-bold text-white bg-accent rounded-full px-1.5 py-0.5">
                        -{ed.discount_pct}%
                      </span>
                    )}
                    <span className="text-right">
                      <span className={clsx('font-semibold block', active ? 'text-accent' : '')}>
                        {!usable
                          ? <span className="text-xs font-medium">Цена уточняется</span>
                          : ed.is_free
                            ? 'Бесплатно'
                            : p != null ? `${p} BYN` : '—'}
                      </span>
                      {usable && p != null && minEditionPrice != null && p > minEditionPrice && (
                        <span className="block text-[11px] text-text-secondary font-medium">
                          +{p - minEditionPrice} BYN
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price */}
      <PriceDisplay price={price} discountPct={discount} size="lg" />

      {/* Region price comparison */}
      {showCompare && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full border',
              cheaper === 'UA'
                ? 'border-accent/50 bg-accent/10 text-accent font-semibold'
                : 'border-border text-text-secondary'
            )}
          >
            UA: {uaPrice} BYN{cheaper === 'UA' && ' · выгоднее'}
          </span>
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full border',
              cheaper === 'TR'
                ? 'border-accent/50 bg-accent/10 text-accent font-semibold'
                : 'border-border text-text-secondary'
            )}
          >
            TR: {trPrice} BYN{cheaper === 'TR' && ' · выгоднее'}
          </span>
          {cheaper === 'TR' && (
            <span className="text-text-secondary w-full">
              Покупка игр из TR-каталога временно приостановлена — уточните у менеджера.
            </span>
          )}
        </div>
      )}

      {/* Что входит в выбранное издание.
          Список приезжает с сервера полем features — его снимает парсер со
          страницы PS Store, и лежал он без дела: покупатель видел «Ultimate
          Edition +72 BYN» и ни слова о том, за что доплачивает. */}
      {selected?.features?.length ? (
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold text-text-primary mb-2">
            Что входит в «{selected.edition_label || selected.edition_name}»
          </p>
          <ul className="space-y-1.5">
            {selected.features.slice(0, 8).map((f) => (
              <li key={f} className="flex gap-2 text-text-secondary text-sm leading-snug">
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Предзаказ: что произойдёт и когда.
          Раньше на карточке стояло только «Требует немедленной оплаты» — фраза,
          которая на товаре за три сотни читается как угроза, а не как условие. */}
      {product.is_preorder && (
        <div className="bg-bg-card border border-accent/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-text-primary mb-3">Как работает предзаказ</p>
          <ol className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">1.</span>
              <span>Сегодня оформляете и оплачиваете заказ — цена предзаказа закрепляется за вами.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">2.</span>
              <span>
                {releaseLabel ? `${releaseLabel} — игра выходит.` : 'Игра выходит в день релиза.'}
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="text-accent font-bold shrink-0">3.</span>
              <span>В день выхода присылаем доступ — ждать после релиза не придётся.</span>
            </li>
          </ol>
          <p className="text-text-secondary/70 text-xs mt-3 leading-relaxed">
            Дату выхода назначает издатель и может её перенести — тогда вместе с ней
            сдвинется и выдача.
          </p>
        </div>
      )}

      {/* Условия покупки — рядом с ценой, а не в подвале.
          До этого покупатель не находил на карточке ответа ни на один из
          вопросов, которые задаёт менеджеру каждый первый: какой нужен
          аккаунт, когда придёт, что если не сработает, в чём платить. */}
      <ul className="space-y-2.5 text-sm">
        <li className="flex gap-2.5">
          <Globe className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            Аккаунт региона{' '}
            <span className="text-text-primary font-medium">
              {region === 'TR' ? 'Турция (TR)' : 'Украина (UA)'}
            </span>
            . Основной аккаунт менять не нужно —{' '}
            <Link href="/how-to-buy" className="text-accent hover:underline">
              как это работает
            </Link>
          </span>
        </li>
        <li className="flex gap-2.5">
          <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            {product.is_preorder
              ? 'Доступ выдаём к дате выхода игры, а не в момент оплаты'
              : 'В рабочее время 10:00–22:00 — обычно около 30 минут. Ночные заказы — с утра'}
          </span>
        </li>
        <li className="flex gap-2.5">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            Не сработает — заменим или вернём деньги в течение 48 часов —{' '}
            <Link href="/guarantees" className="text-accent hover:underline">
              гарантии
            </Link>
          </span>
        </li>
        <li className="flex gap-2.5">
          <CreditCard className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="text-text-secondary">
            Оплата в BYN после того, как менеджер подтвердит заказ
          </span>
        </li>
      </ul>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!price}
          className={clsx(
            'btn flex-1',
            added ? 'btn-secondary !border-green-500/40 !text-green-400' : 'btn-primary'
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Добавлено в корзину
            </>
          ) : inCart ? (
            <>
              <Check className="w-4 h-4" />
              В корзине
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {price ? `Купить за ${price} BYN` : 'Цена уточняется'}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => toggleFavourite(product)}
          aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={isFav}
          className={clsx('btn btn-secondary w-12 shrink-0 !px-0', isFav && '!border-accent/50 !text-accent')}
        >
          <Heart className={clsx('w-5 h-5', isFav && 'fill-current')} />
        </button>
      </div>

      {/* После добавления покупателю нужен путь дальше. Раньше его не было
          вовсе: кнопка меняла надпись на «Добавлено», и человек оставался на
          той же странице искать корзину сам. */}
      {added && (
        <Link
          href="/cart"
          className="btn btn-secondary btn-block !border-accent/40 hover:!border-accent"
        >
          Перейти в корзину
        </Link>
      )}

      {/* Telegram — запасной путь, а не второе равноправное действие.
          Две одинаковые кнопки рядом заставляли выбирать способ покупки
          вместо того, чтобы покупать. */}
      <a
        href={getTelegramLink(product.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 text-text-secondary text-xs font-medium hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
        </svg>
        Удобнее в Telegram? Напишите менеджеру
        <ExternalLink className="w-3 h-3" />
      </a>

      {/* Мобильная закреплённая панель покупки.
          Рендерится порталом в body: template.tsx оборачивает контент в
          motion.div с transform, а из-за transform position:fixed внутри
          привязывается к этому div, а не к вьюпорту. Портал выносит панель
          наружу. Стоит над нижней навигацией (MobileTabBar) и над Chat FAB
          (тот поднимается на --pdp-cta-h). Логику добавления не дублирует —
          тот же handleAdd, тот же payload; ярлык из фактического состояния
          корзины (inCart). Только мобильные, только после монтирования. */}
      {mounted &&
        createPortal(
          <div
            className="md:hidden fixed inset-x-0 z-40 border-t border-border bg-surface-1/95 backdrop-blur-xl"
            style={{ bottom: 'calc(var(--mobile-nav-h) + env(safe-area-inset-bottom))' }}
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          {price == null ? (
            <span className="text-sm font-semibold text-text-secondary">Цена уточняется</span>
          ) : (
            <div className="flex items-baseline gap-2 overflow-hidden">
              <span
                className={clsx(
                  'shrink-0 whitespace-nowrap text-base font-extrabold tracking-tight',
                  discount > 0 ? 'text-accent' : 'text-text-primary'
                )}
              >
                {price} BYN
              </span>
              {oldPrice != null && (
                <span className="whitespace-nowrap text-xs text-text-muted line-through">
                  {oldPrice}
                </span>
              )}
              {discount > 0 && (
                <span className="shrink-0 rounded-pill bg-accent px-1.5 py-0.5 text-2xs font-bold text-accent-contrast">
                  -{Math.round(discount)}%
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!price}
          aria-label={inCart ? 'Уже в корзине — добавить ещё' : 'Добавить в корзину'}
          className={clsx('btn btn-sm shrink-0 px-5', added || inCart ? 'btn-secondary !text-accent' : 'btn-primary')}
        >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Добавлено
                </>
              ) : inCart ? (
                <>
                  <Check className="w-4 h-4" />
                  В корзине
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  В корзину
                </>
              )}
            </button>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
