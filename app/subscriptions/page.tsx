import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getManagerLink } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { SUBSCRIPTIONS_FAQ, subscriptionsFaqJsonLd } from '@/lib/subscriptions-faq';

/**
 * Подписки — страница под запросы «пс плюс купить беларусь» и подобные.
 *
 * До этого здесь была таблица цен и три предложения над ней. Поисковику
 * нечего оценивать: цифры он не читает как текст, а вопрос покупателя
 * («чем Extra отличается от Deluxe и не пропадут ли игры») страница не
 * закрывала совсем.
 */

export const metadata: Metadata = {
  title: 'Подписки PS Plus и EA Play — цены в Беларуси',
  description:
    'PS Plus Essential, Extra и Deluxe на 1, 3 и 12 месяцев по ценам в BYN. Чем отличаются тарифы, что даёт каждый и почему в нашем регионе Deluxe вместо Premium.',
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
              PS Plus и EA Play в Беларуси
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">
              Все тарифы и сроки в одном месте, цены в белорусских рублях. Ниже — чем
              отличаются уровни подписки и что выбрать под ваши задачи.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <PricingTable />
        </ScrollReveal>

        <div className="mt-16 prose-dark">
          <h2>Какой тариф выбрать</h2>
          <p>
            Уровни складываются друг на друга: каждый следующий включает всё из
            предыдущего и добавляет своё. Переплачивать за верхний тариф имеет смысл
            только если вам нужно именно то, что он добавляет.
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
            className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors inline-block"
          >
            Написать менеджеру
          </a>
        </div>
      </div>
    </>
  );
}
