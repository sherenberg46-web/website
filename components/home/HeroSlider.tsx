'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { normalizeImageUrl, getTelegramLink } from '@/lib/api';

interface Props {
  banners: Banner[];
}

export function HeroSlider({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

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
    <section
      className="relative w-full overflow-hidden bg-bg-page"
      style={{ minHeight: 'calc(100vh - 52px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={imageUrl}
            alt={banner.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-page via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center" style={{ minHeight: 'calc(100vh - 52px)' }}>
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="max-w-xl"
        >
          {banner.subtitle && (
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
              {banner.subtitle}
            </p>
          )}
          <h1
            className="font-bold leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {banner.title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href={linkHref}
              className="btn-gradient text-black font-semibold px-8 py-3.5 rounded-full text-sm"
            >
              Смотреть
            </Link>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white text-sm font-semibold hover:border-white/40 transition-colors backdrop-blur-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              Открыть в Telegram
            </a>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function DefaultHero() {
  return (
    <section
      className="relative w-full flex items-center bg-bg-page overflow-hidden"
      style={{ minHeight: 'calc(100vh - 52px)' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,170,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,170,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-page" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-accent text-sm font-semibold uppercase tracking-widest mb-6"
        >
          Цифровые игры PlayStation · Беларусь
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-bold leading-none tracking-tight mb-6 text-gradient"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          Ваш магазин<br />PlayStation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-secondary text-lg mb-10 max-w-lg mx-auto"
        >
          Игры, подписки и DLC по лучшим ценам в BYN. Мгновенная доставка кода.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/games"
            className="btn-gradient text-black font-semibold px-10 py-4 rounded-full text-base"
          >
            Смотреть каталог
          </Link>
          <a
            href={getTelegramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-10 py-4 rounded-full border border-border text-text-primary text-base font-semibold hover:border-accent/40 transition-colors"
          >
            Открыть в Telegram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
