import type { Metadata } from 'next';
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Подписки PS Plus и EA Play — цены в Беларуси',
  description:
    'PS Plus Essential, Extra, Deluxe и EA Play на 1, 3 и 12 месяцев. Регионы Украина и Турция. Лучшие цены в BYN, активация на ваш аккаунт.',
};

export default function SubscriptionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ScrollReveal>
        <div className="mb-12 text-center">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-3">
            Подписки
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            PS Plus и EA Play
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Все тарифы и сроки в одном месте. Цены указаны для регионов Украина и Турция —
            выбирайте выгодный. Активация на ваш аккаунт с помощью менеджера.
          </p>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <PricingTable />
      </ScrollReveal>
    </div>
  );
}
