import { Zap, Shield, DollarSign, Headphones } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Мгновенная доставка',
    desc: 'Код приходит в Telegram сразу после оплаты. Никаких ожиданий.',
  },
  {
    icon: DollarSign,
    title: 'Лучшие цены',
    desc: 'Честные цены в BYN, без скрытых наценок. Регулярные акции и скидки.',
  },
  {
    icon: Shield,
    title: 'Гарантия',
    desc: 'Гарантируем работоспособность всех кодов. Проблема? Решим быстро.',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    desc: 'Менеджер в Telegram всегда на связи. Ответим на любой вопрос.',
  },
];

export function Benefits() {
  return (
    <section className="section-pad">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Почему выбирают нас
          </h2>
          <p className="text-center text-text-secondary mb-12 max-w-lg mx-auto">
            Мы работаем с 2020 года и за это время стали одним из самых надёжных магазинов цифровых игр в Беларуси.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map((b, i) => (
            <ScrollReveal key={b.title} delay={i * 0.1}>
              <div className="bg-bg-card border border-border rounded-2xl p-6 h-full hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <b.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-text-primary font-semibold mb-2">{b.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{b.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
