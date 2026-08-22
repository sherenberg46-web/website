import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { PromoStrip } from '@/components/layout/PromoStrip';
import { Footer } from '@/components/layout/Footer';
import { MetaPixel } from '@/components/analytics/MetaPixel';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';
import { getSiteUrl } from '@/lib/site-url';
import { COMPANY } from '@/lib/company';
import { SupportChat } from '@/components/support/SupportChat';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GAME STORE — Цифровые игры PlayStation | Беларусь',
    template: '%s | GAME STORE',
  },
  description:
    'Купите цифровые игры PlayStation по лучшим ценам в Беларуси. Выдача обычно за 30 минут, гарантия. PS4, PS5, PS Plus, пополнение кошелька PSN.',
  keywords: [
    'PlayStation',
    'PS4',
    'PS5',
    'игры',
    'Беларусь',
    'BYN',
    'цифровые игры',
    'PS Plus',
    'купить игры',
    'PSN',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_BY',
    siteName: 'GAME STORE',
    title: 'GAME STORE — Цифровые игры PlayStation | Беларусь',
    description:
      'Лучший магазин цифровых игр PlayStation в Беларуси. Игры, подписки, DLC по ценам BYN.',
    // Картинка превью. Без неё ссылка на главную, отправленная в Telegram,
    // Viber или соцсеть, выглядела голой строкой — а именно так магазин чаще
    // всего и пересылают друг другу. У карточек товара превью было всегда
    // (обложка игры), у главной — нет.
    // JPG, а не PNG: та же картинка в PNG весит 692 КБ против 126 КБ, а
    // превью должно успеть загрузиться в мессенджере до того, как человек
    // пролистает сообщение.
    images: [
      {
        url: '/og-cover.jpg',
        width: 1200,
        height: 630,
        alt: 'GAME STORE — цифровые игры PlayStation в Беларуси',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GAME STORE — Цифровые игры PlayStation',
    description: 'Лучший магазин цифровых игр PlayStation в Беларуси.',
    images: ['/og-cover.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Подтверждение прав в Google Search Console и Яндекс.Вебмастере.
  // Коды выдают сами панели; кладём их в переменные окружения, а не в код,
  // чтобы не публиковать в репозитории и чтобы можно было поменять без сборки.
  // Пока переменных нет — мета-теги просто не выводятся.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
};

/**
 * Разметка организации — одна на весь сайт.
 *
 * По ней поисковик связывает домен, название магазина и контакты в один
 * объект и может показать карточку компании в выдаче. Без неё «GAME STORE»
 * для робота просто слова в заголовке.
 */
const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: COMPANY.brand,
  legalName: `${COMPANY.legalForm} ${COMPANY.fullName}`,
  // taxID — тот самый УНП. Поисковики сопоставляют его с реестрами и по нему
  // отличают настоящий бизнес от анонимной витрины.
  taxID: COMPANY.unp,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'Цифровые игры PlayStation, подписки PS Plus и пополнение кошелька PSN для Беларуси.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: COMPANY.city,
    addressCountry: 'BY',
  },
  telephone: COMPANY.phone,
  email: COMPANY.email,
  areaServed: { '@type': 'Country', name: 'Беларусь' },
  currenciesAccepted: 'BYN',
  openingHours: 'Mo-Su 10:00-22:00',
  sameAs: [
    process.env.NEXT_PUBLIC_TG_BOT || 'https://t.me/GameDigitalShop_bot',
    COMPANY.telegram,
  ],
};

/** Поиск по сайту — из этой разметки Google делает строку поиска прямо в выдаче */
const searchLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GAME STORE',
  url: SITE_URL,
  inLanguage: 'ru-BY',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/games?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0b0e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchLd) }}
        />
      </head>
      <body className="bg-bg-page text-text-primary min-h-screen flex flex-col">
        <MetaPixel />
        <YandexMetrika />
        <Header />
        {/* Анонс акции PLUS5 — под фиксированной шапкой, скрывается сам
            по концу срока или после использования кода. */}
        <PromoStrip />
        <main className="flex-1">{children}</main>
        {/* Консультант доступен на любой странице — как в приложении. */}
        <SupportChat />
        <Footer />
      </body>
    </html>
  );
}
