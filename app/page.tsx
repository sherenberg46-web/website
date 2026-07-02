import { getBanners, getFeaturedProducts, getProducts, getPopularProducts } from '@/lib/api';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { Benefits } from '@/components/home/Benefits';
import { HowToBuy } from '@/components/home/HowToBuy';
import { FAQ } from '@/components/home/FAQ';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import { getTelegramLink } from '@/lib/api';

export const revalidate = 120;

export default async function HomePage() {
  const [banners, featured, newGames, onSale, preorders, subscriptions, topups] =
    await Promise.allSettled([
      getBanners(),
      getFeaturedProducts(12),
      getProducts({ task_type: 'new_games', limit: 12 }),
      getProducts({ sort: 'discount', limit: 12 }),
      getProducts({ is_preorder: true, limit: 12 }),
      getProducts({ product_type: 'subscription', limit: 8 }),
      getProducts({ product_type: 'topup', limit: 8 }),
    ]).then((results) =>
      results.map((r) => (r.status === 'fulfilled' ? r.value : []))
    );

  return (
    <>
      {/* Hero */}
      <HeroSlider banners={banners as Parameters<typeof HeroSlider>[0]['banners']} />

      {/* Carousels */}
      <div className="max-w-7xl mx-auto px-4 space-y-16 py-20">
        {(featured as Awaited<ReturnType<typeof getFeaturedProducts>>).length > 0 && (
          <ProductCarousel
            title="Хиты продаж"
            products={featured as Awaited<ReturnType<typeof getFeaturedProducts>>}
            viewAllHref="/games?sort=rating"
            accentTitle
          />
        )}

        {(newGames as Awaited<ReturnType<typeof getProducts>>).length > 0 && (
          <ProductCarousel
            title="Новинки"
            products={newGames as Awaited<ReturnType<typeof getProducts>>}
            viewAllHref="/new"
          />
        )}

        {(onSale as Awaited<ReturnType<typeof getProducts>>).length > 0 && (
          <ProductCarousel
            title="Скидки"
            products={onSale as Awaited<ReturnType<typeof getProducts>>}
            viewAllHref="/sale"
          />
        )}

        {(preorders as Awaited<ReturnType<typeof getProducts>>).length > 0 && (
          <ProductCarousel
            title="Предзаказы"
            products={preorders as Awaited<ReturnType<typeof getProducts>>}
            viewAllHref="/preorders"
          />
        )}
      </div>

      {/* PS Plus & TopUp section */}
      {((subscriptions as Awaited<ReturnType<typeof getProducts>>).length > 0 ||
        (topups as Awaited<ReturnType<typeof getProducts>>).length > 0) && (
        <div className="bg-bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 py-16 space-y-14">
            {(subscriptions as Awaited<ReturnType<typeof getProducts>>).length > 0 && (
              <ProductCarousel
                title="PS Plus — подписки"
                products={subscriptions as Awaited<ReturnType<typeof getProducts>>}
                viewAllHref="/games?product_type=subscription"
              />
            )}
            {(topups as Awaited<ReturnType<typeof getProducts>>).length > 0 && (
              <ProductCarousel
                title="Пополнение кошелька PSN"
                products={topups as Awaited<ReturnType<typeof getProducts>>}
                viewAllHref="/games?product_type=topup"
              />
            )}
          </div>
        </div>
      )}

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
                  Откройте наш бот — быстрые уведомления о скидках, удобный каталог и поддержка прямо в мессенджере.
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
