import Link from 'next/link';
import { Search, ShoppingCart, MessageCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getTelegramLink, getManagerLink } from '@/lib/api';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Выберите игру',
    desc: 'Найдите нужную игру в каталоге или воспользуйтесь поиском. Доступны фильтры по платформе, жанру и цене.',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Оформите заказ',
    desc: 'Добавьте товар в корзину и заполните форму заказа — укажите имя и контакт в Telegram или телефон.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Получите код',
    desc: 'Менеджер свяжется с вами в Telegram, подтвердит заказ и отправит код активации.',
  },
];

export function HowToBuy() {
  return (
    <section className="section-pad">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Как купить
          </h2>
          <p className="text-text-secondary mb-8 max-w-md">
            Простой процесс покупки — от выбора игры до получения кода за несколько минут.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-10">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.12}>
              <div className="relative h-full">
                <div className="bg-bg-card border border-border rounded-2xl p-6 h-full hover:border-border-strong transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-accent text-accent-contrast font-extrabold text-sm flex items-center justify-center leading-none shrink-0">
                      {i + 1}
                    </span>
                    <step.icon className="w-5 h-5 text-accent" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-text-primary font-semibold text-base mb-2">{step.title}</h3>
                  <p className="text-text-muted text-[13px] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/games"
              className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-md transition-colors"
            >
              Перейти в каталог
            </Link>
            <a
              href={getManagerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
            >
              Написать менеджеру
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
