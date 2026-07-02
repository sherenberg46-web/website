'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, X, Menu, Gamepad2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { getTelegramLink } from '@/lib/api';
import { RegionSwitcher } from './RegionSwitcher';
import { SearchBox } from './SearchBox';
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const favProducts = useFavouritesStore((s) => s.products);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const cartCount = mounted ? cartItems.reduce((s, i) => s + i.qty, 0) : 0;
  const favCount = mounted ? favProducts.length : 0;

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || menuOpen
            ? 'bg-bg-page/90 backdrop-blur-xl border-b border-border shadow-glow-card'
            : 'bg-transparent'
        )}
        style={{ height: '52px' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight text-text-primary group-hover:text-gradient transition-all">
              GAME STORE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-text-primary bg-bg-card'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <SearchBox />

            <RegionSwitcher />

            <Link
              href="/favourites"
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              title="Избранное"
            >
              <Heart className="w-4 h-4" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
              title="Корзина"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 ml-2 px-3 py-1.5 btn-gradient text-black text-xs font-semibold rounded-full"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              Telegram
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-bg-page/95 backdrop-blur-xl pt-[52px]">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-4 py-3 rounded-xl text-base font-medium transition-colors',
                  pathname === link.href
                    ? 'text-text-primary bg-bg-card'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/favourites" className="px-4 py-3 rounded-xl text-base font-medium text-text-secondary">
              Избранное {favCount > 0 && <span className="text-accent">({favCount})</span>}
            </Link>
            <Link href="/cart" className="px-4 py-3 rounded-xl text-base font-medium text-text-secondary">
              Корзина {cartCount > 0 && <span className="text-accent">({cartCount})</span>}
            </Link>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 py-3 btn-gradient text-black font-semibold rounded-full"
            >
              Открыть в Telegram
            </a>
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '52px' }} />
    </>
  );
}
