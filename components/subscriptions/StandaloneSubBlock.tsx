'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { REGIONS, getClientRegion, type Region } from '@/lib/region';
import { RegionBadge } from '@/components/ui/RegionBadge';
import { getManagerLink } from '@/lib/api';
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
  /** Цена за 1 месяц в BYN по регионам */
  prices: Record<Region, number>;
  /** Короткая пометка под кнопкой — например, где ещё доступна подписка */
  note?: string;
}

/**
 * Подписка без позиции в каталоге API (GTA+, Ubisoft+ Classics).
 * В корзину её положить нельзя — сервер такого product_id не знает и заказ
 * не пройдёт. Поэтому вместо корзины — оформление через менеджера, как и
 * любой нестандартный заказ в магазине.
 */
export function StandaloneSubBlock({
  id,
  name,
  tagline,
  cover,
  features,
  games,
  prices,
  note,
}: Props) {
  const [region, setRegion] = useState<Region>('UA');
  const [expanded, setExpanded] = useState(false);

  // Стартуем с региона из шапки — как в таблице цен подписок
  useEffect(() => {
    setRegion(getClientRegion());
  }, []);

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

          {/* Цена и заказ */}
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

            <a
              href={getManagerLink(`Здравствуйте! Хочу оформить подписку ${name} (${region}, 1 месяц)`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold bg-accent hover:bg-accent-hover text-accent-contrast transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
              </svg>
              Заказать в Telegram
            </a>
            <p className="mt-3 text-xs text-text-muted leading-relaxed">
              Оформление через менеджера: подтвердит цену и активирует подписку на ваш
              аккаунт.
              {note ? ` ${note}` : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
