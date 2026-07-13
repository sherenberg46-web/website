'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { normalizeImageUrl, getTelegramLink } from '@/lib/api';

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
      ? `/games/${banner.link_ua.replace('/product/', '')}`
      : banner.link_ua.startsWith('/collection/')
      ? `/collections/${banner.link_ua.replace('/collection/', '')}`
      : banner.link_ua.startsWith('/sale')
      ? '/sale'
      : '/games'
    : '/games';

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-bg-card h-[300px] sm:h-[360px] lg:h-[440px]"
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
              <Image
                src={imageUrl}
                alt={banner.title}
                fill
                priority
                className="object-cover"
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
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
            <h1
              className="font-extrabold leading-none tracking-tight mb-5 text-white"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}
            >
              {banner.title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link
                href={linkHref}
                className="bg-accent hover:bg-accent-hover text-white font-bold px-7 py-3 rounded-md text-sm transition-colors"
              >
                Смотреть
              </Link>
              <a
                href={getTelegramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-7 py-3 rounded-md border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
                </svg>
                Telegram
              </a>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-md bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-accent hover:border-accent transition-colors"
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
      <div className="relative w-full overflow-hidden rounded-xl bg-bg-card h-[300px] sm:h-[360px] lg:h-[440px] flex items-center">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-bg-card to-bg-page" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,84,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,84,0,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

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
            Игры, подписки и DLC по лучшим ценам в BYN. Мгновенная доставка кода.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/games"
              className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md text-sm transition-colors"
            >
              Смотреть каталог
            </Link>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-md border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Открыть в Telegram
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
