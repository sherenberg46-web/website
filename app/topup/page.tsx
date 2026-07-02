import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { TopupList } from '@/components/topup/TopupList';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Пополнение кошелька PSN — Украина и Турция',
  description:
    'Пополнение кошелька PlayStation Store: гривны (UA) и лиры (TR). Быстро, надёжно, лучшие цены в BYN.',
};

export const revalidate = 300;

export default async function TopupPage() {
  const [ua, tr] = await Promise.all([
    getProducts({ product_type: 'topup', region: 'UA', limit: 50 }).catch(() => []),
    getProducts({ product_type: 'topup', region: 'TR', limit: 50 }).catch(() => []),
  ]);

  const sortByPrice = (a: { price_byn: number | null }, b: { price_byn: number | null }) =>
    (a.price_byn ?? 0) - (b.price_byn ?? 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-12 text-center">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Кошелёк PSN
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Пополнение кошелька
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Пополним ваш кошелёк PlayStation Store — покупайте игры и дополнения самостоятельно
            по региональным ценам.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-12">
        <ScrollReveal>
          <TopupList
            title="Украина"
            flag="🇺🇦"
            note="Пополнение в гривнах — для аккаунтов региона Украина"
            products={[...ua].sort(sortByPrice)}
          />
        </ScrollReveal>
        <ScrollReveal>
          <TopupList
            title="Турция"
            flag="🇹🇷"
            note="Карты пополнения в лирах — для аккаунтов региона Турция"
            products={[...tr].sort(sortByPrice)}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
