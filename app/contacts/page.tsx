import type { Metadata } from 'next';
import { MessageCircle, Clock, Mail } from 'lucide-react';
import { getTelegramLink } from '@/lib/api';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами — Telegram, email. Ответим быстро.',
};

export default function ContactsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-4">Контакты</h1>
        <p className="text-text-secondary mb-12">
          Мы всегда на связи и готовы помочь с любым вопросом.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <ScrollReveal>
          <a
            href={getTelegramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-bg-card border border-border hover:border-accent/40 rounded-2xl p-6 transition-colors group"
          >
            <MessageCircle className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
              Telegram
            </h3>
            <p className="text-text-secondary text-sm">@GameDigitalShop_bot</p>
            <p className="text-text-secondary text-xs mt-2">
              Основной способ связи — отвечаем быстро
            </p>
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <Clock className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-text-primary mb-1">Время работы</h3>
            <p className="text-text-secondary text-sm">Пн–Вс: 10:00 – 22:00</p>
            <p className="text-text-secondary text-xs mt-2">
              В нерабочее время принимаем заказы, обрабатываем с утра
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-6">
            Не нашли ответ на свой вопрос? Напишите нам напрямую — ответим в ближайшее время.
          </p>
          <a
            href={getTelegramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient text-black font-semibold px-8 py-3.5 rounded-full inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Написать в Telegram
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
