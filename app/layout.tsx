import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GAME STORE — Цифровые игры PlayStation | Беларусь',
    template: '%s | GAME STORE',
  },
  description:
    'Купите цифровые игры PlayStation по лучшим ценам в Беларуси. Мгновенная доставка кода, гарантия. PS4, PS5, PS Plus, пополнение кошелька PSN.',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GAME STORE — Цифровые игры PlayStation',
    description: 'Лучший магазин цифровых игр PlayStation в Беларуси.',
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="bg-bg-page text-text-primary min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
