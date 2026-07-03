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

function isUA(title: string): boolean {
  const t = title.toLowerCase();
  return t.includes('гривен') || t.includes('грн') || t.includes('store ua');
}

function isTR(title: string): boolean {
  const t = title.toLowerCase();
  return t.includes('store tl') || t.includes('лир');
}

export default async function TopupPage() {
  // Все карты пополнения; регионы различаем по валюте в названии
  // (в базе у всех топапов region=UA)
  const all = await getProducts({ product_type: 'topup', limit: 100 }).catch(() => []);
  const byPrice = (a: { price_byn: number | null }, b: { price_byn: number | null }) =>
    (a.price_byn ?? 0) - (b.price_byn ?? 0);

  const ua = all.filter((p) => isUA(p.title)).sort(byPrice);
  const tr = all.filter((p) => isTR(p.title)).sort(byPrice);

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

      <div className="space-y-14">
        <ScrollReveal>
          <TopupList
            title="Украина"
            regionCode="UA"
            note="Пополнение в гривнах — для аккаунтов региона Украина"
            products={ua}
          />
        </ScrollReveal>
        <ScrollReveal>
          <TopupList
            title="Турция"
            regionCode="TR"
            note="Карты пополнения в лирах — для аккаунтов региона Турция"
            products={tr}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
