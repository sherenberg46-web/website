import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Clock, Percent, Gift } from 'lucide-react';
import { getCollectionBySlug } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { EaPlayPurchase } from '@/components/eaplay/EaPlayPurchase';

export const metadata: Metadata = {
  title: 'EA Play — подписка на игры EA в Беларуси',
  description:
    'Подписка EA Play на 1 и 12 месяцев по ценам в BYN. Каталог игр EA, пробные версии новинок до 10 часов, скидка 10% на цифровые покупки EA.',
  alternates: { canonical: '/ea-play' },
};

export const revalidate = 300;

const FEATURES = [
  { icon: Gamepad2, title: 'Каталог игр EA', text: 'Десятки игр Electronic Arts — от FIFA и UFC до Star Wars и Need for Speed' },
  { icon: Clock, title: 'Пробные версии новинок', text: 'До 10 часов в новых играх EA ещё до их выхода' },
  { icon: Percent, title: 'Скидка 10%', text: 'На цифровые покупки EA: игры, дополнения и внутриигровую валюту' },
  { icon: Gift, title: 'Ежемесячные награды', text: 'Внутриигровые бонусы для популярных игр EA' },
];

export default async function EaPlayPage() {
  const siteUrl = getSiteUrl();

  // Каталог EA Play — существующая коллекция из API (slug задан на бэкенде).
  // Если коллекция недоступна — страница всё равно откроется без сетки игр.
  let games = null;
  try {
    const col = await getCollectionBySlug('ea-play');
    games = col.products ?? null;
  } catch {
    games = null;
  }

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'EA Play', item: `${siteUrl}/ea-play` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-text-primary">Главная</Link>
          <span>/</span>
          <span className="text-text-primary">EA Play</span>
        </nav>

        {/* Hero */}
        <ScrollReveal>
          <div className="relative rounded-2xl border border-border overflow-hidden mb-10">
            <div className="relative aspect-[21/9] min-h-[220px]">
              <Image
                src="/images/ea-play-banner.jpg"
                alt="EA Play"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/95 via-[#050609]/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                  EA Play
                </h1>
                <p className="text-text-secondary text-sm sm:text-base">
                  Подписка Electronic Arts: каталог игр, ранний доступ к новинкам
                  и скидка на покупки. Выдача в рабочее время — обычно около 30 минут.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Что даёт подписка */}
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-12">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3.5 bg-bg-card border border-border rounded-2xl px-5 py-5 h-full hover:border-border-strong transition-colors"
              >
                <f.icon className="w-[22px] h-[22px] text-accent shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <div className="text-[13.5px] font-bold text-text-primary leading-snug">
                    {f.title}
                  </div>
                  <div className="text-[11.5px] text-text-muted leading-relaxed mt-1">
                    {f.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Покупка */}
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8">
            Выберите срок подписки
          </h2>
          <EaPlayPurchase />
        </ScrollReveal>

        {/* Игры каталога */}
        {games && games.length > 0 && (
          <div className="mt-16">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Игры в каталоге EA Play
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                Эти игры доступны по подписке — состав каталога периодически меняется.
              </p>
            </ScrollReveal>
            <ProductGrid products={games} />
          </div>
        )}
      </div>
    </>
  );
}
