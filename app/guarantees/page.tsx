import type { Metadata } from 'next';
import { Shield, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import { getManagerLink } from '@/lib/api';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Гарантии',
  description: 'Гарантии качества и возврата средств в магазине GAME STORE.',
};

const GUARANTEES = [
  {
    icon: CheckCircle,
    title: '100% рабочие коды',
    desc: 'Все коды проверяются перед отправкой. Гарантируем, что код будет работать.',
  },
  {
    icon: RefreshCw,
    title: 'Замена или возврат',
    desc: 'Если код не сработал по нашей вине — заменим или вернём деньги без лишних вопросов.',
  },
  {
    icon: Clock,
    title: 'Быстрое решение',
    desc: 'Проблемы решаем в течение 24 часов после обращения. Обычно значительно быстрее.',
  },
  {
    icon: Shield,
    title: 'Безопасная покупка',
    desc: 'Оплата только после подтверждения заказа. Ваши деньги защищены.',
  },
];

export default function GuaranteesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Наши гарантии</h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Мы несём полную ответственность за качество каждого заказа.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {GUARANTEES.map((g, i) => (
          <ScrollReveal key={g.title} delay={i * 0.1}>
            <div className="bg-bg-card border border-border rounded-2xl p-6 h-full">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <g.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">{g.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{g.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal className="prose-dark">
        <h2>Условия гарантии</h2>
        <ul>
          <li>Гарантия действует при условии, что код не был активирован до обращения</li>
          <li>Срок обращения — до 48 часов после получения кода</li>
          <li>Возврат средств производится тем же способом, которым была произведена оплата</li>
          <li>Возврат невозможен, если код был активирован успешно</li>
        </ul>

        <h2>Как получить помощь</h2>
        <p>
          Напишите нам в Telegram с описанием проблемы и скриншотом ошибки (если есть).
          Мы ответим как можно скорее.
        </p>
      </ScrollReveal>

      <ScrollReveal className="text-center mt-10">
        <a
          href={getManagerLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors inline-block"
        >
          Написать менеджеру
        </a>
      </ScrollReveal>
    </div>
  );
}
