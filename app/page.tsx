import type { Metadata } from 'next';
import Link from 'next/link';
import { getBanners, getProducts, getPopularProducts, getTelegramLink } from '@/lib/api';
import { faqJsonLd } from '@/lib/faq';
import { getRegion } from '@/lib/region-server';
import type { Banner, Product } from '@/lib/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { SubscriptionsShowcase } from '@/components/home/SubscriptionsShowcase';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { Benefits } from '@/components/home/Benefits';
import { HowToBuy } from '@/components/home/HowToBuy';
import { FAQ } from '@/components/home/FAQ';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Регион берётся из cookie → страница рендерится динамически,
// данные при этом кэшируются на уровне fetch (revalidate в lib/api).
export const dynamic = 'force-dynamic';

// Главная — единственная страница без своих метаданных: заголовок и описание
// берутся из макета. Но каноничный адрес нужен и ей, иначе `/?region=UA`
// и `/?utm_source=...` для робота выглядят как отдельные главные страницы.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function val<T>(r: PromiseSettledResult<T>, fallback: T): T {
  return r.status === 'fulfilled' ? r.value : fallback;
}

export default async function HomePage() {
  const region = getRegion();
  const isTR = region === 'TR';

  const empty: Product[] = [];
  const [bannersR, newGamesR, preordersR, top10R, onSaleR, topupsR, popularR, cheapR] =
    await Promise.allSettled([
      getBanners(),
      // new_games всегда отдаёт UA-каталог (несёт цены обоих регионов) — как в Mini App
      isTR ? Promise.resolve(empty) : getProducts({ task_type: 'new_games', limit: 12 }),
      isTR ? Promise.resolve(empty) : getProducts({ task_type: 'preorders', region, limit: 12 }),
      isTR ? Promise.resolve(empty) : getProducts({ section: 'top15', region, limit: 10 }),
      isTR
        ? Promise.resolve(empty)
        : getProducts({ task_type: 'sales', sort: 'discount', region, limit: 12 }),
      getProducts({ product_type: 'topup', region, limit: 12 }),
      isTR ? Promise.resolve(empty) : getPopularProducts(20, region),
      // Дешёвые игры заслуживают своей полки, а не места в «популярном».
      // Раньше они попадали туда сами: полка сортировалась по размеру
      // скидки, и наверх выцарапывались LEGO по 19 BYN с −91 %. Здесь они
      // работают на импульсную покупку, а не создают впечатление, что в
      // магазине больше ничего нет.
      getProducts({ price_max: 20, region, sort: 'rating', limit: 12 }),
    ]);

  const banners = val<Banner[]>(bannersR, []);
  const newGames = val(newGamesR, empty);
  const preorders = val(preordersR, empty);
  const top10 = val(top10R, empty);
  const onSale = val(onSaleR, empty);
  const topups = val(topupsR, empty);
  const cheap = val(cheapR, empty);
  // Спрос: одинаковые названия из разных регионов схлопываем, а то, что уже
  // стоит в «Топ 10», из полки убираем — иначе две соседние карусели
  // показывают одни и те же игры.
  //
  // Фильтр по региону оставлен как страховка: сервер теперь отбирает регион
  // сам, но до его выката витрина не должна показывать турецкие карточки в
  // украинской полке.
  const seen = new Set<string>();
  const inTop = new Set(top10.map((p) => p.id));
  const popularOwn = val(popularR, empty)
    .filter((p) => p.region === region)
    .filter((p) => !inTop.has(p.id))
    .filter((p) => {
      const key = p.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);

  return (
    <>
      {/* Те же вопросы, что в блоке ниже, но в виде разметки: Google умеет
          разворачивать их прямо в выдаче под ссылкой на сайт. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      {/* Hero */}
      <HeroSlider banners={banners} />

      {/* Заголовок страницы и три обещания.
          У главной не было своего h1 вовсе: единственный h1 жил внутри
          баннера и менялся вместе со слайдом — для поисковика страница
          называлась то «GTA VI», то названием следующей акции. А покупатель,
          пришедший из выдачи, за первые секунды должен понять три вещи: что
          здесь продают, в чём платить и когда получит. Обещания те же, что
          дальше по странице, — расходиться им нельзя. */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Цифровые игры PlayStation в Беларуси
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Игры для PS4 и PS5, подписки PS Plus и пополнение кошелька PSN. Оплата в
          белорусских рублях, выдача в рабочее время обычно около 30 минут, гарантия
          на каждый заказ.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-12 py-10">
        {/* TR: игры из турецкого каталога временно недоступны — как в Mini App */}
        {isTR && (
          <ScrollReveal>
            <div className="bg-bg-card border border-border rounded-xl p-10 text-center max-w-2xl mx-auto">
              <div className="text-5xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-3">Временно недоступно</h2>
              <p className="text-text-secondary">
                Покупка игр из турецкого каталога временно приостановлена.
              </p>
              <p className="text-text-secondary mt-1">
                Но вы можете купить подписку PS Plus или пополнить кошелёк 👇
              </p>
            </div>
          </ScrollReveal>
        )}

        {newGames.length > 0 && (
          <ProductCarousel title="Новинки" products={newGames} viewAllHref="/new" accentTitle />
        )}

        {preorders.length > 0 && (
          <ProductCarousel title="Предзаказы" products={preorders} viewAllHref="/preorders" />
        )}

        {/* Без ссылки «Все»: в полке ровно десять позиций, показывать по ней
            весь каталог по рейтингу — обманывать ожидание. */}
        {top10.length > 0 && <ProductCarousel title="Топ 10" products={top10} />}

        {onSale.length > 0 && (
          <ProductCarousel title="Скидки" products={onSale} viewAllHref="/sale" />
        )}

        {/* «Сейчас покупают» — наш собственный спрос: заказы и просмотры.
            Раньше полка звалась «Популярное», подписывалась «чаще всего
            смотрят», а на деле сортировалась по размеру скидки — ни одного
            просмотра в этом не участвовало. И ссылка «все» вела на страницу
            распродажи, что честно отражало содержимое, но не название.

            Из полки убираем то, что уже стоит в «Топ 10»: тот берёт чарт
            PS Store, и без вычитания две полки подряд показывали бы одно и
            то же. */}
        {popularOwn.length > 0 && (
          <ProductCarousel
            title="Сейчас покупают"
            eyebrow="Заказы и просмотры в нашем магазине"
            products={popularOwn}
          />
        )}

        {cheap.length > 0 && (
          <ProductCarousel
            title="Игры до 20 BYN"
            eyebrow="Недорого и сразу"
            products={cheap}
            viewAllHref="/games?price_max=20"
          />
        )}

        <RecentlyViewed />
      </div>

      {/* PS Plus + Пополнение PSN */}
      <div className="bg-bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-14">
          <ScrollReveal>
            <SubscriptionsShowcase region={region} />
          </ScrollReveal>
          {topups.length > 0 && (
            <ProductCarousel
              title="Пополнение кошелька PSN"
              products={topups}
              viewAllHref="/topup"
            />
          )}
        </div>
      </div>

      {/* Telegram CTA */}
      <ScrollReveal>
        <section className="section-pad">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="relative bg-bg-card rounded-xl border border-border p-10 md:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-card-glow" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-accent mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Удобнее в Telegram
                </h2>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                  Откройте наш бот — быстрые уведомления о скидках, удобный каталог и поддержка
                  прямо в мессенджере.
                </p>
                <a
                  href={getTelegramLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-10 py-4 rounded-md text-base inline-flex items-center gap-2 transition-colors"
                >
                  Открыть бота
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Benefits />
      <HowToBuy />
      <FAQ />
    </>
  );
}
