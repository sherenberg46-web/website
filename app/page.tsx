import type { Metadata } from 'next';
import Link from 'next/link';
import { getBanners, getProducts, getPopularProducts, getTelegramLink } from '@/lib/api';
import { faqJsonLd } from '@/lib/faq';
import { getRegion } from '@/lib/region-server';
import type { Banner, Product } from '@/lib/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { Benefits } from '@/components/home/Benefits';
import { HowToBuy } from '@/components/home/HowToBuy';
import { FAQ } from '@/components/home/FAQ';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { TrGamesBlocked } from '@/components/products/TrGamesBlocked';

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
  const [bannersR, newGamesR, preordersR, top10R, onSaleR, popularR] =
    await Promise.allSettled([
      getBanners(),
      // new_games всегда отдаёт UA-каталог (несёт цены обоих регионов) — как в Mini App
      isTR ? Promise.resolve(empty) : getProducts({ task_type: 'new_games', limit: 12 }),
      isTR ? Promise.resolve(empty) : getProducts({ task_type: 'preorders', region, limit: 12 }),
      isTR ? Promise.resolve(empty) : getProducts({ section: 'top15', region, limit: 10 }),
      // Полка «Скидки» — от дорогих: иначе сортировка по размеру скидки
      // выцарапывала наверх игры по 10 BYN с −90 %.
      isTR
        ? Promise.resolve(empty)
        : getProducts({ task_type: 'sales', sort: 'price_desc', region, limit: 12 }),
      isTR ? Promise.resolve(empty) : getPopularProducts(20, region),
    ]);

  const banners = val<Banner[]>(bannersR, []);
  const newGames = val(newGamesR, empty);
  const preorders = val(preordersR, empty);
  const top10 = val(top10R, empty);
  const onSale = val(onSaleR, empty);
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

      {/* Заголовок страницы, обещание и первичный CTA.
          У главной не было своего h1 вовсе: единственный h1 жил внутри
          баннера и менялся вместе со слайдом — для поисковика страница
          называлась то «GTA VI», то названием следующей акции. А покупатель,
          пришедший из выдачи, за первые секунды должен понять три вещи: что
          здесь продают, в чём платить и когда получит — и сразу иметь кнопку
          к товарам. Обещания те же, что дальше по странице, — расходиться им
          нельзя. */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Цифровые игры PlayStation в Беларуси
        </h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Игры PS4 и PS5, подписки PS Plus и пополнение кошелька PSN. Оплата в
          белорусских рублях, выдача обычно за 30 минут, гарантия на каждый заказ.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/games" className="btn btn-primary">
            Смотреть каталог
          </Link>
          <Link href="/sale" className="btn btn-secondary">
            Скидки
          </Link>
        </div>
      </section>

      {/* Товары идут первыми — до преимуществ и плиток разделов: покупатель
          должен увидеть, что можно купить сейчас, не проматывая пол-экрана
          инфоблоков. */}
      <div className="max-w-7xl mx-auto px-4 space-y-10 py-8">
        {/* TR: игры из турецкого каталога временно недоступны — как в Mini App */}
        {isTR && <TrGamesBlocked />}

        {newGames.length > 0 && (
          <ProductCarousel title="Новинки" products={newGames} viewAllHref="/new" accentTitle />
        )}

        {preorders.length > 0 && (
          <ProductCarousel title="Предзаказы" products={preorders} viewAllHref="/preorders" />
        )}

        {/* «Все» для Топ 10 ведёт в каталог по рейтингу: отдельной страницы
            чарта на сайте нет, а сортировка «По рейтингу» — ближайший
            честный аналог. */}
        {top10.length > 0 && (
          <ProductCarousel title="Топ 10" products={top10} viewAllHref="/games?sort=rating" />
        )}

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

        <RecentlyViewed />
      </div>

      {/* Преимущества — компактной строкой уже после первых товаров */}
      <Benefits />

      {/* Визуальная навигация по разделам — ниже товаров, чтобы не оттеснять их */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CategoryTiles />
      </div>

      {/* Telegram CTA */}
      <section className="section-pad">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="rounded-card border border-border bg-surface-1 px-6 py-9 md:py-11">
            <h2 className="text-2xl font-bold tracking-tight mb-2.5">
              Удобнее в Telegram
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Скидки, каталог и поддержка — прямо в мессенджере
            </p>
            <a
              href={getTelegramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Открыть бота
            </a>
          </div>
        </div>
      </section>

      <HowToBuy />
      <FAQ />
    </>
  );
}
