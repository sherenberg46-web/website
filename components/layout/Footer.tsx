import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { getTelegramLink } from '@/lib/api';

const SHOP_LINKS = [
  { href: '/games', label: 'Каталог игр' },
  { href: '/sale', label: 'Распродажа' },
  { href: '/new', label: 'Новинки' },
  { href: '/preorders', label: 'Предзаказы' },
  { href: '/collections/ps-plus-top', label: 'PS Plus' },
  { href: '/favourites', label: 'Избранное' },
];

const INFO_LINKS = [
  { href: '/how-to-buy', label: 'Как купить' },
  { href: '/guarantees', label: 'Гарантии' },
  { href: '/contacts', label: 'Контакты' },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-text-primary">GAME STORE</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Цифровые игры PlayStation для Беларуси. Быстро, выгодно, с гарантией.
            </p>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              @GameDigitalShop_bot
            </a>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Магазин</h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Информация</h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-text-primary font-semibold text-sm mb-4">Платформы</h3>
            <ul className="space-y-2">
              {[
                { href: '/games?platform=PS5', label: 'PlayStation 5' },
                { href: '/games?platform=PS4', label: 'PlayStation 4' },
                { href: '/subscriptions', label: 'PS Plus' },
                { href: '/topup', label: 'Пополнение PSN' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-xs">
            © {new Date().getFullYear()} GAME STORE. Все права защищены.
          </p>
          <p className="text-text-secondary text-xs">
            Цены указаны в белорусских рублях (BYN)
          </p>
        </div>
      </div>
    </footer>
  );
}
