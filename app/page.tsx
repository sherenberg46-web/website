import Link from 'next/link';
import { getBanners, getProducts, getTelegramLink } from '@/lib/api';
import { getRegion } from '@/lib/region-server';
import type { Banner, Product } from '@/lib/types';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { SubscriptionsShowcase } from '@/components/home/SubscriptionsShowcase';
import { Benefits } from '@/components/home/Benefits';
import { HowToBuy } from '@/components/home/HowToBuy';
import { FAQ } from '@/components/home/FAQ';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

// Регион берётся из cookie → страница рендерится динамически,
// данные при этом кэшируются на уровне fetch (revalidate в lib/api).
export const dynamic = 'force-dynamic';

function val<T>(r: PromiseSettledResult<T>, fallback: T): T {
  return r.status === 'fulfilled' ? r.value : fallback;
}

export default async function HomePage() {
  const region = getRegion();
  const isTR = region === 'TR';

  const empty: Product[] = [];
  const [bannersR, newGamesR, preordersR, top10R, onSaleR, topupsR] =
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
    ]);

  const banners = val<Banner[]>(bannersR, []);
  const newGames = val(newGamesR, empty);
  const preorders = val(preordersR, empty);
  const top10 = val(top10R, empty);
  const onSale = val(onSaleR, empty);
  const topups = val(topupsR, empty);

  return (
    <>
      {/* Hero */}
      <HeroSlider banners={banners} />

      <div className="max-w-7xl mx-auto px-4 space-y-16 py-20">
        {/* TR: игры из турецкого каталога временно недоступны — как в Mini App */}
        {isTR && (
          <ScrollReveal>
            <div className="bg-bg-card border border-border rounded-3xl p-10 text-center max-w-2xl mx-auto">
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

        {top10.length > 0 && (
          <ProductCarousel title="Топ 10" products={top10} viewAllHref="/games?sort=rating" />
        )}

        {onSale.length > 0 && (
          <ProductCarousel title="Скидки" products={onSale} viewAllHref="/sale" />
        )}
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
              viewAllHref="/games?product_type=topup"
            />
          )}
        </div>
      </div>

      {/* Telegram CTA */}
      <ScrollReveal>
        <section className="section-pad">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="relative bg-bg-card rounded-3xl border border-border p-10 md:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-card-glow" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
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
                  className="btn-gradient text-black font-semibold px-10 py-4 rounded-full text-base inline-flex items-center gap-2"
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
