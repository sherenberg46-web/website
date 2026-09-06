import { Zap, Shield, DollarSign, Headphones } from 'lucide-react';

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

/**
 * Компактная строка доверия. Стоит уже после первых полок с товарами, поэтому
 * задача блока — поддержать решение о покупке, а не занять первый экран.
 * На мобильном — сетка 2×2, без пер-карточной анимации (чистый сервер-компонент).
 */
export function Benefits() {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-8">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface-1 p-3.5 transition-colors hover:border-border-strong sm:flex-row sm:items-start sm:gap-3 sm:p-4"
          >
            <b.icon
              className="h-5 w-5 shrink-0 text-accent"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <div>
              <h3 className="text-[13px] font-semibold text-text-primary">{b.title}</h3>
              <p className="mt-0.5 text-2xs leading-relaxed text-text-muted">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
