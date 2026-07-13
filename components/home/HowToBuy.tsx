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
    <section className="section-pad bg-bg-card/30">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Как купить
          </h2>
          <p className="text-center text-text-secondary mb-12 max-w-md mx-auto">
            Простой процесс покупки — от выбора игры до получения кода за несколько минут.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.12}>
              <div className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+12px)] w-full h-px bg-gradient-to-r from-accent/40 to-transparent z-10 -translate-x-6" />
                )}
                <div className="bg-bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl font-bold text-gradient opacity-60 leading-none shrink-0">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-text-primary font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/games"
              className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors"
            >
              Перейти в каталог
            </Link>
            <a
              href={getManagerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors"
            >
              Написать менеджеру
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
