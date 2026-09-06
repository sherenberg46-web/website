'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, LayoutGrid, Search, Heart, Menu, X, Send } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cartStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { getTelegramLink } from '@/lib/api';
import { NAV_LINKS } from './nav-links';
import { SearchOverlay } from './SearchOverlay';

/** Разделы, при которых подсвечивается вкладка «Каталог». */
const CATALOG_PREFIXES = ['/games', '/sale', '/new', '/preorders', '/collections'];

/**
 * Постоянная нижняя навигация для мобильных.
 *
 * Пять пунктов на существующие маршруты + два оверлея (полноэкранный поиск
 * и шторка «Меню» — бывшее содержимое гамбургера из шапки). Никакой
 * бизнес-логики: счётчики читаются из тех же Zustand-сторов, что и шапка,
 * ссылки ведут на уже существующие страницы.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const favIds = useFavouritesStore((s) => s.ids);
  const cartCount = mounted ? cartItems.reduce((s, i) => s + i.qty, 0) : 0;
  const favCount = mounted ? favIds.length : 0;

  useEffect(() => setMounted(true), []);

  // Любой переход закрывает оверлеи
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Блокировка прокрутки фона, пока открыт полноэкранный слой
  useEffect(() => {
    const lock = menuOpen || searchOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  // Esc закрывает меню (у поиска свой обработчик)
  useEffect(() => {
    if (!menuOpen) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [menuOpen]);

  const isHome = pathname === '/';
  const isCatalog = CATALOG_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  const isFav = pathname === '/favourites';

  type Tab = {
    key: string;
    label: string;
    icon: typeof Home;
    href?: string;
    onClick?: () => void;
    active: boolean;
    badge?: number;
  };

  const tabs: Tab[] = [
    { key: 'home', label: 'Главная', icon: Home, href: '/', active: isHome },
    { key: 'catalog', label: 'Каталог', icon: LayoutGrid, href: '/games', active: isCatalog },
    { key: 'search', label: 'Поиск', icon: Search, onClick: () => setSearchOpen(true), active: searchOpen },
    { key: 'fav', label: 'Избранное', icon: Heart, href: '/favourites', active: isFav, badge: favCount },
    { key: 'menu', label: 'Меню', icon: Menu, onClick: () => setMenuOpen(true), active: menuOpen },
  ];

  return (
    <>
      <nav
        aria-label="Основная навигация"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-page/95 backdrop-blur-xl pb-safe"
      >
        <ul className="flex items-stretch">
          {tabs.map((t) => {
            const content = (
              <span className="relative flex h-14 w-full flex-col items-center justify-center gap-1">
                {t.active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" />
                )}
                <span className="relative">
                  <t.icon
                    className={clsx(
                      'w-[22px] h-[22px] transition-colors',
                      t.active ? 'text-accent' : 'text-text-secondary'
                    )}
                    strokeWidth={t.active ? 2.4 : 1.9}
                  />
                  {mounted && t.badge ? (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-contrast">
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={clsx(
                    'text-[11px] font-medium leading-none transition-colors',
                    t.active ? 'text-accent' : 'text-text-secondary'
                  )}
                >
                  {t.label}
                </span>
              </span>
            );

            return (
              <li key={t.key} className="flex-1">
                {t.href ? (
                  <Link
                    href={t.href}
                    aria-current={t.active ? 'page' : undefined}
                    className="tap-target flex w-full items-center justify-center"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={t.onClick}
                    aria-haspopup="dialog"
                    aria-expanded={t.active}
                    className="tap-target flex w-full items-center justify-center"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Шторка «Меню» — бывшее содержимое гамбургера */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-[60] overflow-hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={clsx(
            'absolute inset-0 bg-black/60 transition-opacity duration-200',
            menuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          className={clsx(
            'absolute right-0 top-0 flex h-full w-[min(20rem,86vw)] flex-col border-l border-border bg-surface-1 shadow-elevation-3 transition-transform duration-300 ease-out',
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="font-bold text-text-primary">Меню</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
              className="tap-target -mr-2 flex items-center justify-center rounded-control text-text-secondary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto py-2"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <nav className="flex flex-col px-2">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      'flex min-h-[48px] items-center rounded-control px-3 text-[15px] font-medium transition-colors',
                      active ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mx-4 my-2 border-t border-border" />

            <nav className="flex flex-col px-2">
              <Link
                href="/favourites"
                className="flex min-h-[48px] items-center justify-between rounded-control px-3 text-[15px] font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                <span>Избранное</span>
                {favCount > 0 && <span className="text-sm text-accent">{favCount}</span>}
              </Link>
              <Link
                href="/cart"
                className="flex min-h-[48px] items-center justify-between rounded-control px-3 text-[15px] font-medium text-text-primary transition-colors hover:bg-white/5"
              >
                <span>Корзина</span>
                {cartCount > 0 && <span className="text-sm text-accent">{cartCount}</span>}
              </Link>
            </nav>

            <div className="px-4 pt-3">
              <a
                href={getTelegramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block"
              >
                <Send className="w-4 h-4" />
                Открыть в Telegram
              </a>
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
