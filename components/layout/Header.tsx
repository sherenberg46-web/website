'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { getTelegramLink } from '@/lib/api';
import { RegionSwitcher } from './RegionSwitcher';
import { SearchBox } from './SearchBox';
import { NAV_LINKS } from './nav-links';
import clsx from 'clsx';

/**
 * Шапка.
 *
 * Мобильная версия — компактная: логотип · регион · корзина. Поиск,
 * избранное, Telegram и разделы каталога вынесены в нижнюю навигацию
 * и в шторку «Меню» (см. MobileTabBar). Десктопная версия (широкий поиск
 * + второй ряд разделов) не изменилась и живёт под md:.
 */
export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const favIds = useFavouritesStore((s) => s.ids);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cartItems.reduce((s, i) => s + i.qty, 0) : 0;
  const favCount = mounted ? favIds.length : 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-page/90 backdrop-blur-xl border-b border-border">
        {/* Верхняя строка: лого · поиск (десктоп) · действия */}
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Image
              src="/logo.png"
              alt="GAME STORE"
              width={30}
              height={30}
              className="rounded-full"
              priority
            />
            <span className="font-extrabold text-base tracking-tight text-text-primary">
              GAME<span className="text-accent">STORE</span>
            </span>
          </Link>

          {/* Широкий поиск — только десктоп */}
          <div className="hidden md:flex flex-1 justify-center">
            <SearchBox />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0 shrink-0">
            <RegionSwitcher />

            <Link
              href="/favourites"
              className="relative hidden md:flex w-11 h-11 items-center justify-center rounded-control text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              title="Избранное"
            >
              <Heart className="w-[18px] h-[18px]" />
              {favCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-accent text-accent-contrast text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative w-11 h-11 flex items-center justify-center rounded-control text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              title="Корзина"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-accent text-accent-contrast text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 ml-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-contrast text-xs font-bold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor">
                <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
              </svg>
              Telegram
            </a>
          </div>
        </div>

        {/* Нижняя строка: навигация по разделам — только десктоп */}
        <nav className="hidden md:block border-t border-border/60">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'relative my-1.5 px-4 py-2 text-[13.5px] font-bold tracking-wide whitespace-nowrap rounded-lg transition-all',
                    active
                      ? 'text-text-primary bg-bg-card'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/70'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1.5 left-3 right-3 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Spacer: 56px мобильный / 97px десктоп (верхняя строка + навигация) */}
      <div className="h-14 md:h-[97px]" />
    </>
  );
}
