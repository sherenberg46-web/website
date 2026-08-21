'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { FitImage } from '@/components/ui/FitImage';
import { normalizeImageUrl } from '@/lib/api';
import { gamePath } from '@/lib/product-url';

interface Props {
  banners: Banner[];
}

export function HeroSlider({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  // Баннеры с битыми картинками — показываем фирменный градиент вместо дыры
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const reduceMotion = useReducedMotion();

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused, banners.length]);

  if (!banners.length) return <DefaultHero />;

  const banner = banners[current];
  const imageUrl = normalizeImageUrl(banner.image_url);
  const imageFailed = failed.has(banner.id);
  const linkHref = banner.link_ua
    ? banner.link_ua.startsWith('/product/')
      ? gamePath(banner.link_ua.replace('/product/', ''))
      : banner.link_ua.startsWith('/collection/')
      ? `/collections/${banner.link_ua.replace('/collection/', '')}`
      : banner.link_ua.startsWith('/sale')
      ? '/sale'
      : '/games'
    : '/games';

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4">
      {/* Пропорции вместо фиксированных высот.
          Раньше стояло h-300/360/440px: баннер 2:1 при ширине телефона в 360 px
          попадал в рамку 1,2:1 и терял 40 % ширины — логотип игры уезжал за край.
          Теперь рамка на каждом экране близка к форме исходника, а остаток
          добирает размытая подложка внутри FitImage. */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-bg-card aspect-[4/3] sm:aspect-[2/1] lg:aspect-[12/5]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {imageFailed ? (
              /* Фолбэк: фирменный градиент вместо битой картинки */
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-bg-card to-bg-page" />
              </div>
            ) : (
              <FitImage
                src={imageUrl}
                alt={banner.title}
                priority
                className="absolute inset-0"
                sizes="(max-width: 1280px) 100vw, 1280px"
                onError={() =>
                  setFailed((s) => {
                    const ns = new Set(s);
                    ns.add(banner.id);
                    return ns;
                  })
                }
              />
            )}
            {/* Затемнение слева под текст */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/95 via-[#050609]/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-14">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, x: reduceMotion ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="max-w-lg"
          >
            {banner.subtitle && (
              <p className="text-accent text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
                {banner.subtitle}
              </p>
            )}
            {/* Название акции — не заголовок страницы.
                Здесь стоял единственный h1 главной, и он менялся вместе со
                слайдом: для поисковика страница называлась то «GTA VI», то
                названием следующей акции. Главная — это магазин, а не баннер;
                настоящий h1 теперь стоит на самой странице. Вид не изменился:
                те же размеры, только тег другой. */}
            <p
              className="font-extrabold leading-none tracking-tight mb-5 text-white"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}
            >
              {banner.title}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={linkHref}
                className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-7 py-3 rounded-lg text-sm transition-colors"
              >
                Смотреть
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Предыдущий баннер"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-md bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:border-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Следующий баннер"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-accent-contrast transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Баннер ${i + 1}: ${b.title}`}
                  aria-current={i === current}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function DefaultHero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="max-w-7xl mx-auto px-4 pt-4">
      <div className="relative w-full overflow-hidden rounded-xl bg-bg-card aspect-[4/3] sm:aspect-[2/1] lg:aspect-[12/5] flex items-center">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-bg-card to-bg-page" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(254,199,44,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(254,199,44,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 px-6 sm:px-10 lg:px-14 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent text-xs sm:text-sm font-bold uppercase tracking-widest mb-4"
          >
            Цифровые игры PlayStation · Беларусь
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-extrabold leading-none tracking-tight mb-5 text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
          >
            Ваш магазин<br />PlayStation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-base sm:text-lg mb-8 max-w-lg"
          >
            Игры, подписки и DLC по лучшим ценам в BYN. Выдача обычно за 30 минут.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/games"
              className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-lg text-sm transition-colors"
            >
              Смотреть каталог
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
