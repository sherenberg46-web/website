import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import { TopupTabs, type TopupSection } from '@/components/topup/TopupTabs';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Пополнение кошелька PSN — Украина, Турция, Польша, Индия',
  description:
    'Пополнение кошелька PlayStation Store: гривны (UA), лиры (TR), злотые (PL), рупии (IN). Быстро, надёжно, лучшие цены в BYN.',
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-10 text-center">
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

      <ScrollReveal>
        <TopupTabs sections={sections} />
      </ScrollReveal>
    </div>
  );
}
