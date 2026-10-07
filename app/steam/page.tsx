import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { KeyRound, Wallet, Globe2, MessageCircle, ShieldCheck } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SteamPurchase } from '@/components/steam/SteamPurchase';
import { STEAM_DAILY_LIMIT_USD, STEAM_IMAGE, STEAM_OFFERS } from '@/lib/steam';

export const metadata: Metadata = {
  title: 'Пополнение Steam в Беларуси — по логину, без пароля',
  description:
    'Пополнение кошелька Steam по логину от $5 до $100 с оплатой в BYN. Пароль, почта и код Steam Guard не нужны — менеджер пополнит баланс после оплаты.',
  alternates: { canonical: '/steam' },
};

const FEATURES = [
  { icon: KeyRound, title: 'Только логин', text: 'Пароль, почту и код Steam Guard мы не запрашиваем' },
  { icon: Wallet, title: 'Оплата в BYN', text: 'Картой или через ЕРИП, цена на сайте окончательная' },
  { icon: Globe2, title: 'Игры, DLC и предметы', text: 'Баланс тратится на всё, что продаётся в Steam' },
  { icon: MessageCircle, title: 'Менеджер на связи', text: 'Напишет в Telegram, подтвердит заказ и сообщит, когда баланс пополнен' },
];

const STEPS = [
  { n: 1, title: 'Выберите сумму', text: `От $${STEAM_OFFERS[0].usd} до $${STEAM_OFFERS[STEAM_OFFERS.length - 1].usd} — цена в BYN видна сразу.` },
  { n: 2, title: 'Оформите заказ', text: 'Укажите логин Steam. Менеджер свяжется в Telegram и подтвердит оплату.' },
  { n: 3, title: 'Баланс на аккаунте', text: 'После оплаты пополняем кошелёк и сообщаем, что деньги пришли.' },
];

const FAQ = [
  {
    q: 'Где найти логин Steam?',
    a: 'Это имя аккаунта, которым вы входите в Steam, а не имя профиля и не email. Его видно в клиенте Steam: «Steam» → «Настройки» → «Аккаунт», строка «Имя аккаунта». Если вы пока не вошли, логин покажет и страница store.steampowered.com/account.',
  },
  {
    q: 'Нужен ли пароль или код Steam Guard?',
    a: 'Нет. Для пополнения достаточно логина: пароль, почту и коды подтверждения не просим и не принимаем.',
  },
  {
    q: 'Можно ли пополнить аккаунт любого региона?',
    a: 'Уточните у менеджера при оформлении: сумма приходит в валюте кошелька вашего аккаунта, и для некоторых регионов применяется пересчёт из долларов.',
  },
  {
    q: 'Сколько можно пополнить за раз?',
    a: `Steam ограничивает пополнение одного логина — не больше $${STEAM_DAILY_LIMIT_USD} за 24 часа. Если нужно больше, напишите нам: подскажем, как разбить сумму.`,
  },
  {
    q: 'Как оплатить?',
    a: 'В белорусских рублях: переводом на карту (VISA, MasterCard, Белкарт) или через ЕРИП. Оплата — после того, как менеджер подтвердит заказ.',
  },
];

export default function SteamPage() {
  const siteUrl = getSiteUrl();
  const minPrice = Math.min(...STEAM_OFFERS.map((o) => o.price));

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Пополнение Steam', item: `${siteUrl}/steam` },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <ScrollReveal>
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1B75BB] via-[#173B5C] to-[#07080B]">
            <div className="flex items-center gap-6 px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
              <div className="max-w-xl flex-1">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">Steam</p>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Пополнение Steam по логину
                </h1>
                <p className="text-sm text-white/80 sm:text-base">
                  Выберите сумму и оформите заказ: менеджер пополнит ваш кошелёк Steam. Пароль не
                  нужен — только логин. От {minPrice} BYN.
                </p>
              </div>
              <div className="relative hidden aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:block lg:w-48">
                <Image
                  src={STEAM_IMAGE}
                  alt="Пополнение Steam"
                  fill
                  priority
                  sizes="192px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Преимущества */}
        <ScrollReveal>
          <div className="mb-10 grid grid-cols-2 gap-2.5 sm:mb-12 sm:gap-3.5 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex h-full flex-col gap-2.5 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-start sm:gap-3.5 sm:px-5 sm:py-5"
              >
                <f.icon className="h-[22px] w-[22px] shrink-0 text-[#66C0F4] sm:mt-0.5" strokeWidth={1.8} />
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
            Выберите сумму
          </h2>
          <SteamPurchase />
        </ScrollReveal>

        {/* Как это работает */}
        <ScrollReveal>
          <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 md:text-3xl">Как это работает</h2>
            <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3.5">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex gap-3.5 rounded-2xl border border-border bg-bg-card p-4 sm:block sm:p-5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B75BB] text-sm font-bold text-white sm:mb-3">
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
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#66C0F4]" />
              <div className="text-sm leading-relaxed text-text-secondary">
                <p>
                  <span className="font-semibold text-text-primary">Пароль не нужен.</span> Если вас
                  просят пароль или код Steam Guard — это не мы. Для пополнения достаточно логина.
                </p>
                <p className="mt-2">
                  Остались вопросы —{' '}
                  <Link href="/contacts" className="text-[#66C0F4] hover:underline">
                    напишите нам
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Вопросы */}
        <ScrollReveal>
          <div className="mx-auto mt-12 max-w-4xl sm:mt-16">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:mb-6 md:text-3xl">Частые вопросы</h2>
            <div className="space-y-2.5">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border border-border bg-bg-card px-5 py-4 open:border-[#1B75BB]/50"
                >
                  <summary className="cursor-pointer list-none font-bold text-text-primary marker:hidden">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
