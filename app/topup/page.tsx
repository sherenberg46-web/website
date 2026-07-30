import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getManagerLink } from '@/lib/api';
import { getSiteUrl } from '@/lib/site-url';
import { TOPUP_FAQ, topupFaqJsonLd } from '@/lib/topup-faq';
import { TopupTabs, type TopupSection } from '@/components/topup/TopupTabs';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Пополнение кошелька PSN в Беларуси — Украина, Турция, Польша, Индия',
  description:
    'Пополнение кошелька PlayStation Store из Беларуси: гривны (UA), лиры (TR), злотые (PL), рупии (IN). Как выбрать регион, активировать код и что важно знать заранее.',
  alternates: { canonical: '/topup' },
};

export const revalidate = 300;

// Регионы различаем по валюте в названии (в базе у всех топапов region=UA).
// Русские названия — основной каталог; английские дубли (PSN Poland 50 PLN) не включаем.
function isUA(t: string) {
  return t.includes('гривен') || t.includes('грн') || t.includes('store ua');
}
function isTR(t: string) {
  return t.includes('store tl') || t.includes('лир');
}
function isPL(t: string) {
  return t.includes('злот');
}
function isIN(t: string) {
  return t.includes('рупи');
}

export default async function TopupPage() {
  const all = await getProducts({ product_type: 'topup', limit: 100 }).catch(() => []);
  const byPrice = (a: { price_byn: number | null }, b: { price_byn: number | null }) =>
    (a.price_byn ?? 0) - (b.price_byn ?? 0);
  const pick = (fn: (t: string) => boolean) =>
    all.filter((p) => fn(p.title.toLowerCase())).sort(byPrice);

  const sections: TopupSection[] = [
    {
      code: 'UA',
      title: 'Украина',
      currency: 'грн',
      note: 'Пополнение в гривнах — для аккаунтов региона Украина',
      products: pick(isUA),
    },
    {
      code: 'TR',
      title: 'Турция',
      currency: 'лир',
      note: 'Карты пополнения в лирах — для аккаунтов региона Турция',
      products: pick(isTR),
    },
    {
      code: 'PL',
      title: 'Польша',
      currency: 'зл',
      note: 'Карты пополнения в злотых — для аккаунтов региона Польша',
      products: pick(isPL),
    },
    {
      code: 'IN',
      title: 'Индия',
      currency: '₹',
      note: 'Карты пополнения в рупиях — для аккаунтов региона Индия',
      products: pick(isIN),
    },
  ];

  const siteUrl = getSiteUrl();

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Пополнение кошелька', item: `${siteUrl}/topup` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(topupFaqJsonLd()) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
              Кошелёк PSN
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Пополнение кошелька PSN в Беларуси
            </h1>
            <p className="text-text-secondary max-w-xl mx-auto">
              Деньги на кошелёк PlayStation Store — и покупайте что угодно сами, по
              региональным ценам. Оплата в белорусских рублях, код приходит в Telegram.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <TopupTabs sections={sections} />
        </ScrollReveal>

        <div className="mt-16 prose-dark">
          <h2>Зачем пополнять кошелёк</h2>
          <p>
            Готовый код на игру решает одну задачу — купить эту игру. Деньги на кошельке
            решают любую: подписка, дополнение, внутриигровая валюта, предзаказ, скидка,
            которую вы поймали ночью в распродаже. Всё, что продаётся в вашем регионе
            PlayStation Store, покупается с кошелька без посредника.
          </p>
          <p>
            Отдельно это удобно для покупок, которых нет в нашем каталоге: донат в
            конкретной игре, мелкие дополнения, сезонные пропуска.
          </p>

          <h2>Какой регион выбрать</h2>
          <p>
            Тот же, что у аккаунта, на котором будете тратить. Карта пополнения жёстко
            привязана к региону: гривны зачисляются только на украинский аккаунт, лиры —
            только на турецкий. На аккаунте другого региона код просто не примется.
          </p>
          <p>
            Проверить регион можно на консоли: <strong>Настройки → Пользователи и
            аккаунты → Аккаунт → Информация об аккаунте</strong>. Если аккаунта нужного
            региона ещё нет, как его завести — расписано в разделе{' '}
            <Link href="/how-to-buy">«Как купить»</Link>.
          </p>

          <h2>Как активировать код</h2>
          <ol>
            <li>Войдите на консоли под аккаунтом нужного региона.</li>
            <li>
              Откройте PlayStation Store и выберите <strong>Активировать код</strong> в
              меню профиля справа вверху.
            </li>
            <li>Введите код — сумма появится на кошельке сразу.</li>
          </ol>
          <p>
            Коды складываются: если нужной суммы нет в списке, активируйте несколько
            номиналов подряд на один кошелёк.
          </p>

          <h2>Что нужно знать заранее</h2>
          <p>
            Деньги на кошельке не сгорают — лежат, пока вы их не потратите. Но и обратно
            их не получить: вывести на карту, перевести на другой аккаунт или обменять на
            деньги нельзя. Это правило Sony, одинаковое для всех продавцов. Поэтому
            пополняйте на ту сумму, которую собираетесь потратить в этом регионе.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Частые вопросы</h2>
          <div className="space-y-4">
            {TOPUP_FAQ.map((item) => (
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
            Не уверены, какой регион и номинал вам нужен? Напишите — подберём.
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
