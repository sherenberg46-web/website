'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { REGIONS, getClientRegion, type Region } from '@/lib/region';
import { RegionBadge } from '@/components/ui/RegionBadge';
import type { SubGame } from '@/lib/subscription-games';

const COLLAPSED_COUNT = 12;

interface Props {
  /** Якорь для навигации по странице */
  id: string;
  name: string;
  tagline: string;
  cover: string;
  features: string[];
  games: SubGame[];
  /** ID продукта в каталоге по регионам — как EA_IDS у EA Play */
  productIds: Record<Region, number>;
  /** Цена за 1 месяц в BYN по регионам — совпадает с ценой в базе */
  prices: Record<Region, number>;
  /** Квадратная обложка для корзины */
  cartImage: string;
  /** Короткая пометка под кнопкой — например, где ещё доступна подписка */
  note?: string;
}

/**
 * Отдельная подписка с одним сроком (1 месяц): GTA+, Ubisoft+ Classics.
 * Тот же поток покупки, что в таблице PS Plus и у EA Play: те же ID
 * продуктов, те же цены, та же корзина.
 */
export function StandaloneSubBlock({
  id,
  name,
  tagline,
  cover,
  features,
  games,
  productIds,
  prices,
  cartImage,
  note,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [region, setRegion] = useState<Region>('UA');
  const [added, setAdded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Стартуем с региона из шапки — как в таблице цен подписок
  useEffect(() => {
    setRegion(getClientRegion());
  }, []);

  function buy() {
    addItem({
      product_id: productIds[region],
      edition_id: null,
      edition_name: null,
      qty: 1,
      title: `${name} — 1 месяц (${region})`,
      image_url: cartImage,
      price_byn: prices[region],
      original_price_byn: null,
      discount_pct: 0,
      product_type: 'subscription',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const visible = expanded ? games : games.slice(0, COLLAPSED_COUNT);

  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight mb-2">{name}</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-2xl">{tagline}</p>

      <div className="bg-bg-card border border-border rounded-3xl overflow-hidden">
        {/* Широкая обложка подписки */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src={cover}
            alt={name}
            fill
            quality={85}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        </div>

        <div className="p-6 grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Состав и игры */}
          <div className="min-w-0">
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
              Игры в подписке · {games.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {visible.map((g) => (
                <Link
                  key={g.title}
                  href={`/games?search=${encodeURIComponent(g.title)}`}
                  className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-border hover:border-border-strong rounded-full px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  {g.title}
                  {g.platforms?.map((p) => (
                    <span key={p} className="text-[9px] font-bold text-text-muted">
                      {p}
                    </span>
                  ))}
                </Link>
              ))}
            </div>
            {games.length > COLLAPSED_COUNT && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {expanded ? 'Свернуть' : `Показать все ${games.length}`}
                <ChevronDown
                  className={clsx('w-4 h-4 transition-transform', expanded && 'rotate-180')}
                />
              </button>
            )}
          </div>

          {/* Цена и покупка */}
          <div className="lg:border-l lg:border-border lg:pl-6 flex flex-col">
            <div className="flex gap-1 bg-bg-page border border-border rounded-full p-1 self-start mb-5">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                    region === r.value
                      ? 'bg-brand-gradient text-accent-contrast'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <RegionBadge code={r.value} />
                    {r.value}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold text-text-secondary">1 месяц</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight">{prices[region]}</span>
              <span className="text-text-secondary text-sm font-semibold">BYN</span>
            </div>

            <button
              onClick={buy}
              className={clsx(
                'mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-colors',
                added
                  ? 'bg-accent/20 text-accent'
                  : 'bg-accent hover:bg-accent-hover text-accent-contrast'
              )}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> В корзине
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> В корзину
                </>
              )}
            </button>
            {note && (
              <p className="mt-3 text-xs text-text-muted leading-relaxed">{note}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
