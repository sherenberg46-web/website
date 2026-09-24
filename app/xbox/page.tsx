import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Monitor, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GamePassPurchase } from '@/components/xbox/GamePassPurchase';
import { GAMEPASS_IMAGE, GAMEPASS_OFFERS } from '@/lib/xbox';

export const metadata: Metadata = {
  title: 'Xbox Game Pass Ultimate — купить в Беларуси',
  description:
    'Xbox Game Pass Ultimate от 1 до 12 месяцев по ценам в BYN: на ваш аккаунт Microsoft или на новый. Сотни игр для Xbox и ПК, EA Play, онлайн-игра.',
  alternates: { canonical: '/xbox' },
};

const FEATURES = [
  { icon: Gamepad2, title: 'Сотни игр для Xbox', text: 'Каталог Game Pass на Xbox Series X|S и Xbox One' },
  { icon: Monitor, title: 'Game Pass для ПК', text: 'Те же игры на компьютере — входит в Ultimate' },
  { icon: Sparkles, title: 'EA Play в комплекте', text: 'Каталог игр Electronic Arts без доплаты' },
  { icon: Users, title: 'Онлайн-игра', text: 'Мультиплеер на консоли — бывший Xbox Live Gold' },
];

const STEPS = [
  { n: 1, title: 'Выберите способ и срок', text: 'На ваш аккаунт Microsoft или на новый — он обычно дешевле.' },
  { n: 2, title: 'Оформите заказ', text: 'Менеджер свяжется в Telegram и подтвердит оплату.' },
  { n: 3, title: 'Активация', text: 'Входим в аккаунт и оформляем подписку — обычно за 10–120 минут.' },
];

export default function XboxPage() {
  const siteUrl = getSiteUrl();
  const minPrice = Math.min(...GAMEPASS_OFFERS.map((o) => o.price));

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Xbox Game Pass Ultimate', item: `${siteUrl}/xbox` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <ScrollReveal>
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#107C10] via-[#0B5A0B] to-[#07080B]">
            <div className="flex items-center gap-6 px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
              <div className="max-w-xl flex-1">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">Xbox</p>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Game Pass Ultimate
                </h1>
                <p className="text-sm text-white/80 sm:text-base">
                  Сотни игр для Xbox и ПК, EA Play и онлайн-игра в одной подписке.
                  От 1 до 12 месяцев — от {minPrice} BYN.
                </p>
              </div>
              <div className="relative hidden aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:block lg:w-48">
                <Image
                  src={GAMEPASS_IMAGE}
                  alt="Xbox Game Pass Ultimate"
                  fill
                  priority
                  sizes="192px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Что даёт подписка */}
        <ScrollReveal>
          <div className="mb-10 grid grid-cols-2 gap-2.5 sm:mb-12 sm:gap-3.5 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex h-full flex-col gap-2.5 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-start sm:gap-3.5 sm:px-5 sm:py-5"
              >
                <f.icon className="h-[22px] w-[22px] shrink-0 text-[#4CC24A] sm:mt-0.5" strokeWidth={1.8} />
                <div>
                  <div className="text-[13.5px] font-bold leading-snug text-text-primary">{f.title}</div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-text-muted">{f.text}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Покупка */}
        <ScrollReveal>
          <h2 className="mb-5 text-center text-2xl font-bold tracking-tight sm:mb-8 md:text-3xl">
            Выберите подписку
          </h2>
          <GamePassPurchase />
        </ScrollReveal>

        {/* Как это работает */}
        <ScrollReveal>
          <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 md:text-3xl">Как это работает</h2>
            {/* Телефон: шаги строками с номером слева; десктоп: три карточки */}
            <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3.5">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex gap-3.5 rounded-2xl border border-border bg-bg-card p-4 sm:block sm:p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#107C10] text-sm font-bold text-white sm:mb-3">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">{s.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl border border-border bg-bg-card p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4CC24A]" />
              <div className="text-sm leading-relaxed text-text-secondary">
                <p>
                  <span className="font-semibold text-text-primary">На ваш аккаунт:</span> на нём не
                  должно быть активной подписки Game Pass. Вход нужен только для оформления
                  подписки — данные вы передаёте менеджеру в переписке, не на сайте.
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-text-primary">Новый аккаунт</span> обычно дешевле. Чтобы
                  играть с подпиской и на старом профиле, включите «Домашний Xbox» на своей консоли.
                  Регион аккаунта значения не имеет.
                </p>
                <p className="mt-2">
                  Остались вопросы —{' '}
                  <Link href="/contacts" className="text-[#4CC24A] hover:underline">
                    напишите нам
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
