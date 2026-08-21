import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { StandaloneSubBlock } from '@/components/subscriptions/StandaloneSubBlock';
import { EaPlayPurchase } from '@/components/eaplay/EaPlayPurchase';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getManagerLink } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { STANDALONE_SUB_PRICES, GTA_IDS, UBI_IDS } from '@/lib/subscriptions';
import { GTA_PLUS_GAMES, UBISOFT_CLASSICS_GAMES } from '@/lib/subscription-games';
import { SUBSCRIPTIONS_FAQ, subscriptionsFaqJsonLd } from '@/lib/subscriptions-faq';

/**
 * Подписки — страница под запросы «пс плюс купить беларусь» и подобные.
 *
 * Четыре независимых блока: PS Plus, EA Play, GTA+ и Ubisoft+ Classics.
 * Все покупаются через корзину — те же ID продуктов и цены, что в базе
 * (у EA Play ID общие со страницей /ea-play).
 */

export const metadata: Metadata = {
  title: 'Подписки PS Plus, EA Play, Ubisoft+ и GTA+ — цены в Беларуси',
  description:
    'PS Plus Essential, Extra и Deluxe, EA Play, Ubisoft+ Classics и GTA+ — цены в BYN для украинского и турецкого региона. Чем отличаются подписки, что входит в каждую и что выбрать.',
  alternates: { canonical: '/subscriptions' },
};

export default function SubscriptionsPage() {
  const siteUrl = getSiteUrl();

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Подписки', item: `${siteUrl}/subscriptions` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(subscriptionsFaqJsonLd()) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Подписки
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Все подписки PlayStation в Беларуси
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">
              PS Plus, EA Play, Ubisoft+ Classics и GTA+ — все тарифы в одном месте,
              цены в белорусских рублях. Ниже — чем они отличаются и что выбрать
              под ваши задачи.
            </p>
          </div>
        </ScrollReveal>

        {/* PlayStation Plus */}
        <ScrollReveal>
          <section id="ps-plus" className="scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-tight mb-2">PlayStation Plus</h2>
            <p className="text-text-secondary text-sm mb-6 max-w-2xl">
              Три уровня: Essential для сетевой игры, Extra с каталогом из 400+ игр
              и Deluxe с классикой PS1, PS2 и PSP сверху.
            </p>
            <PricingTable />
          </section>
        </ScrollReveal>

        {/* EA Play */}
        <ScrollReveal>
          <section id="ea-play" className="scroll-mt-24 mt-20">
            <h2 className="text-2xl font-bold tracking-tight mb-2">EA Play</h2>
            <p className="text-text-secondary text-sm mb-8 max-w-2xl">
              Каталог игр Electronic Arts, пробные версии новинок до релиза и скидка
              10% на цифровые покупки EA.
            </p>
            <EaPlayPurchase />
            <Link
              href="/ea-play"
              className="mt-6 flex items-center justify-between bg-bg-card border border-border hover:border-accent/40 rounded-3xl p-6 transition-colors group"
            >
              <div>
                <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
                  Игры в подписке EA Play
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Полный каталог EA Play на отдельной странице
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-accent shrink-0" />
            </Link>
          </section>
        </ScrollReveal>

        {/* Ubisoft+ Classics */}
        <ScrollReveal>
          <div className="mt-20">
            <StandaloneSubBlock
              id="ubisoft-classics"
              name="Ubisoft+ Classics"
              tagline="Каталог отмеченных наградами игр и классических франшиз Ubisoft: Assassin's Creed, Far Cry, Watch Dogs, The Division и десятки других."
              cover="/images/ubisoft-classics-wide.jpg"
              features={[
                '67 игр Ubisoft для PS4 и PS5',
                'Assassin\'s Creed, Far Cry, Watch Dogs',
                'Каталог регулярно пополняется',
                'Входит в PS Plus Extra и Deluxe',
              ]}
              games={UBISOFT_CLASSICS_GAMES}
              productIds={UBI_IDS}
              prices={{ UA: STANDALONE_SUB_PRICES.UA.ubisoft, TR: STANDALONE_SUB_PRICES.TR.ubisoft }}
              cartImage="/images/ubisoft-classics.jpg"
              note="Учтите: та же коллекция уже входит в тарифы PS Plus Extra и Deluxe."
            />
          </div>
        </ScrollReveal>

        {/* GTA+ */}
        <ScrollReveal>
          <div className="mt-20">
            <StandaloneSubBlock
              id="gta-plus"
              name="GTA+"
              tagline="Эксклюзивные преимущества и ежемесячные награды для GTA Online, плюс доступ к избранным играм Rockstar."
              cover="/images/gta-plus-wide.jpg"
              features={[
                'Ежемесячный депозит GTA$ на счёт в GTA Online',
                'Эксклюзивные награды, транспорт и недвижимость',
                'Игры Rockstar в подписке: GTA V, Red Dead Redemption и другие',
                'Бонусы каждый месяц — без доната картами акулы',
              ]}
              games={GTA_PLUS_GAMES}
              productIds={GTA_IDS}
              prices={{ UA: STANDALONE_SUB_PRICES.UA.gtaplus, TR: STANDALONE_SUB_PRICES.TR.gtaplus }}
              cartImage="/images/gta-plus.jpg"
            />
          </div>
        </ScrollReveal>

        <div className="mt-20 prose-dark">
          <h2>Какую подписку выбрать</h2>
          <p>
            Уровни PS Plus складываются друг на друга: каждый следующий включает всё из
            предыдущего и добавляет своё. Переплачивать за верхний тариф имеет смысл
            только если вам нужно именно то, что он добавляет. Остальные подписки
            независимы: они дополняют PS Plus, а не заменяют его.
          </p>

          <h3>
            Essential — если играете по сети
          </h3>
          <p>
            Базовый уровень, без которого в большинстве игр недоступен мультиплеер. Плюс
            несколько игр каждый месяц, 100 ГБ облачных сохранений и скидки для
            подписчиков. Этого достаточно, если вы покупаете игры сами, а подписка нужна
            только чтобы играть с друзьями.
          </p>

          <h3>
            Extra — если хотите играть без покупок
          </h3>
          <p>
            Добавляет каталог из четырёхсот с лишним игр для PS4 и PS5: скачиваете и
            играете, пока подписка действует. Часто выгоднее, чем покупать три-четыре
            игры в год по отдельности — но игры из каталога не остаются у вас навсегда.
          </p>

          <h3>
            Deluxe — если интересна классика
          </h3>
          <p>
            Сверх Extra даёт каталог игр с PS1, PS2 и PSP и пробные версии новинок —
            несколько часов в свежей игре до покупки.
          </p>

          <h3>Ubisoft+ Classics — если любите Ubisoft</h3>
          <p>
            Каталог из почти семидесяти игр Ubisoft: серии Assassin&apos;s Creed, Far Cry,
            Watch Dogs, The Division и другая классика издателя. Покупать отдельно есть
            смысл, если у вас нет PS Plus Extra — та же коллекция уже входит в тарифы
            Extra и Deluxe.
          </p>

          <h3>GTA+ — если живёте в GTA Online</h3>
          <p>
            Ежемесячный депозит GTA$, эксклюзивный транспорт и недвижимость, особые
            награды и доступ к играм Rockstar: GTA V, Red Dead Redemption, L.A. Noire,
            Bully и трилогии GTA. Окупается одним депозитом, если вы и так покупаете
            карты акулы.
          </p>

          <h2>Почему Deluxe, а не Premium</h2>
          <p>
            Это один и тот же верхний тариф под разными названиями. Sony продаёт его как
            Premium там, где работает облачный стриминг игр, и как Deluxe там, где
            стриминга нет. В украинском и турецком регионах — Deluxe. Всё остальное
            наполнение совпадает, поэтому искать «Premium» для этих регионов бессмысленно:
            его там просто не существует.
          </p>

          <h2>Регион аккаунта</h2>
          <p>
            Подписка привязана к региону аккаунта: украинская активируется только на
            украинском аккаунте, турецкая — на турецком. Свой основной аккаунт менять при
            этом не нужно, второй профиль спокойно живёт на той же консоли — как это
            устроено, подробно расписано в разделе{' '}
            <Link href="/how-to-buy">«Как купить»</Link>.
          </p>

          <h2>Что будет, если не продлить</h2>
          <p>
            Игры из каталогов Extra и Deluxe перестанут запускаться — они доступны только
            пока подписка активна. То же с ежемесячными играми Essential: они остаются
            закреплены за аккаунтом, но заработают снова только при новой подписке.
            Игры, купленные отдельно, остаются у вас навсегда и от подписки не зависят.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Частые вопросы</h2>
          <div className="space-y-4">
            {SUBSCRIPTIONS_FAQ.map((item) => (
              <details
                key={item.q}
                className="bg-bg-card border border-border rounded-xl px-5 py-4 group"
              >
                <summary className="font-medium text-text-primary cursor-pointer list-none flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-accent shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-text-secondary text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-6">
            Не уверены, какой тариф и регион вам подойдут? Напишите — подскажем.
          </p>
          <a
            href={getManagerLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-md transition-colors inline-block"
          >
            Написать менеджеру
          </a>
        </div>
      </div>
    </>
  );
}
