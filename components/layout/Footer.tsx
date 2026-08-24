import Link from 'next/link';
import Image from 'next/image';
import { getTelegramLink } from '@/lib/api';
import { COMPANY } from '@/lib/company';

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
  { href: '/guides', label: 'Гайды' },
  { href: '/guarantees', label: 'Гарантии' },
  { href: '/contacts', label: 'Контакты' },
];

/**
 * Правовые документы.
 *
 * Отдельным блоком, а не вперемешку с «Как купить»: покупатель ищет их
 * осознанно — обычно перед оплатой, когда решает, можно ли доверять магазину.
 */
const LEGAL_LINKS = [
  { href: '/offer', label: 'Публичная оферта' },
  { href: '/privacy', label: 'Политика конфиденциальности' },
  { href: '/refund', label: 'Условия возврата' },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_1fr] gap-x-8 gap-y-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="GAME STORE" width={30} height={30} className="rounded-full" />
              <span className="font-extrabold text-text-primary tracking-tight">
                GAME<span className="text-accent">STORE</span>
              </span>
            </Link>
            <p className="text-text-muted text-xs leading-relaxed">
              Цифровые игры PlayStation для Беларуси. Быстро, выгодно, с гарантией.
            </p>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-accent text-xs font-semibold hover:underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
              </svg>
              @GameDigitalShop_bot
            </a>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-text-primary font-semibold text-[13px] mb-4">Магазин</h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-xs hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="text-text-primary font-semibold text-[13px] mb-4">Информация</h3>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-xs hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-text-primary font-semibold text-[13px] mb-4">Платформы</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/games?platform=PS5', label: 'PlayStation 5' },
                { href: '/games?platform=PS4', label: 'PlayStation 4' },
                { href: '/subscriptions', label: 'Подписки' },
                { href: '/topup', label: 'Пополнение PSN' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-xs hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Реквизиты */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-text-primary font-semibold text-[13px] mb-4">Реквизиты</h3>
            <address className="not-italic text-text-muted text-xs leading-relaxed space-y-1.5">
              <p>
                {COMPANY.legalForm} {COMPANY.fullName}
              </p>
              <p>УНП {COMPANY.unp}</p>
              <p>
                {COMPANY.city}, {COMPANY.country}
              </p>
              <p>
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {COMPANY.phoneDisplay}
                </a>
                <span className="text-text-secondary/60"> — телефон и Viber</span>
              </p>
              <p>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {COMPANY.email}
                </a>
              </p>
              <p>{COMPANY.workHours}</p>
            </address>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold text-[13px] mb-4">Документы</h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-xs hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-[11px]">
            © {new Date().getFullYear()} {COMPANY.brand}. Все права защищены.
          </p>
          <p className="text-text-muted text-[11px]">
            Цены указаны в белорусских рублях (BYN)
          </p>
        </div>
      </div>
    </footer>
  );
}
