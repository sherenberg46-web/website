'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { getTelegramLink } from '@/lib/api';
import { RegionSwitcher } from './RegionSwitcher';
import { SearchBox, MobileSearch } from './SearchBox';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/games', label: 'Каталог' },
  { href: '/sale', label: 'Распродажа' },
  { href: '/new', label: 'Новинки' },
  { href: '/preorders', label: 'Предзаказы' },
  { href: '/subscriptions', label: 'PS Plus' },
  { href: '/topup', label: 'Пополнение' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const favProducts = useFavouritesStore((s) => s.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Блокировка прокрутки фона, пока открыто мобильное меню
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const cartCount = mounted ? cartItems.reduce((s, i) => s + i.qty, 0) : 0;
  const favCount = mounted ? favProducts.length : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-page border-b border-border">
        {/* Верхняя строка: лого · поиск · действия */}
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Image
              src="/logo.png"
              alt="GAME STORE"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <span className="font-extrabold text-base tracking-tight text-text-primary uppercase italic">
              Game<span className="text-accent">Store</span>
            </span>
          </Link>

          {/* Широкий поиск — как у Instant Gaming */}
          <div className="hidden md:flex flex-1 justify-center">
            <SearchBox />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0 shrink-0">
            <MobileSearch />

            <RegionSwitcher />

            <Link
              href="/favourites"
              className="relative w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              title="Избранное"
            >
              <Heart className="w-[18px] h-[18px]" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              title="Корзина"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 ml-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              Telegram
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Нижняя строка: навигация по разделам */}
        <nav className="hidden md:block border-t border-border/60 bg-bg-card/40">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'relative px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors',
                    active
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-bg-page/95 backdrop-blur-xl pt-14 overflow-y-auto"
        >
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.03 * i }}
              >
                <Link
                  href={link.href}
                  className={clsx(
                    'block px-4 py-3 rounded-md text-base font-semibold transition-colors',
                    pathname === link.href
                      ? 'text-accent bg-bg-card'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <Link href="/favourites" className="px-4 py-3 rounded-md text-base font-semibold text-text-secondary">
              Избранное {favCount > 0 && <span className="text-accent">({favCount})</span>}
            </Link>
            <Link href="/cart" className="px-4 py-3 rounded-md text-base font-semibold text-text-secondary">
              Корзина {cartCount > 0 && <span className="text-accent">({cartCount})</span>}
            </Link>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-md transition-colors"
            >
              Открыть в Telegram
            </a>
          </nav>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Spacer: 56px мобильный / 97px десктоп (верхняя строка + навигация) */}
      <div className="h-14 md:h-[97px]" />
    </>
  );
}
