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
    <section className="max-w-7xl mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {BENEFITS.map((b, i) => (
          <ScrollReveal key={b.title} delay={i * 0.08}>
            <div className="flex items-start gap-3.5 bg-bg-card border border-border rounded-2xl px-5 py-5 h-full hover:border-border-strong transition-colors">
              <b.icon className="w-[22px] h-[22px] text-accent shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                <h3 className="text-text-primary font-semibold text-[13.5px] mb-1">{b.title}</h3>
                <p className="text-text-muted text-[11.5px] leading-relaxed">{b.desc}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
