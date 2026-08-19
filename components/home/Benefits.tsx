import { Zap, Shield, DollarSign, Headphones } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const BENEFITS = [
  // «Мгновенно» здесь стояло полтора года и противоречило собственной
  // странице «Как купить», где честно написано про 30 минут. Покупатель,
  // прочитавший обе, ловит нас на слове ровно в тот момент, когда решает,
  // можно ли нам доверять. Заказ подтверждает живой менеджер — значит и
  // обещать надо то, что менеджер делает.
  {
    icon: Zap,
    title: 'Быстрая выдача',
    desc: 'В рабочее время 10:00–22:00 — обычно около 30 минут. Ночные заказы — с утра.',
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
    title: 'Живая поддержка',
    desc: 'Менеджер в Telegram с 10:00 до 22:00. Ответим на любой вопрос.',
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
                  <b.icon className="w-6 h-6 text-white" />
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
