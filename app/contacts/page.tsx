import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Clock, Phone } from 'lucide-react';
import { getTelegramLink, getManagerLink } from '@/lib/api';
import { COMPANY } from '@/lib/company';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами — Telegram, email. Ответим быстро.',
  alternates: { canonical: '/contacts' },
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <ScrollReveal>
          <a
            href={getManagerLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-bg-card border border-border hover:border-accent/40 rounded-2xl p-6 transition-colors group"
          >
            <MessageCircle className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
              Менеджер
            </h3>
            <p className="text-text-secondary text-sm">@gamestore_by</p>
            <p className="text-text-secondary text-xs mt-2">
              Вопросы по заказам и оплате — пишите напрямую
            </p>
          </a>
        </ScrollReveal>

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

      {/* Телефон и Viber — один и тот же номер. Для части покупателей это
          единственный привычный способ связи, а для доверия к магазину живой
          номер важнее любого текста «мы надёжные». */}
      <ScrollReveal>
        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <Phone className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Телефон и Viber</h3>
              <a
                href={`tel:${COMPANY.phone}`}
                className="text-text-primary text-lg font-medium hover:text-accent transition-colors"
              >
                {COMPANY.phoneDisplay}
              </a>
              <p className="text-text-secondary text-xs mt-2">
                Viber работает по этому же номеру
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Реквизиты продавца. Покупатель должен видеть, с кем имеет дело, —
          и до оплаты, а не после. */}
      <ScrollReveal>
        <div className="bg-bg-card border border-border rounded-2xl p-6 mb-12">
          <h2 className="font-semibold text-text-primary mb-4">Реквизиты продавца</h2>
          <address className="not-italic text-text-secondary text-sm leading-relaxed space-y-1">
            <p>
              {COMPANY.legalForm} {COMPANY.fullName}
            </p>
            <p>УНП {COMPANY.unp}</p>
            <p>
              {COMPANY.city}, {COMPANY.country}
            </p>
            <p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="hover:text-text-primary transition-colors"
              >
                {COMPANY.email}
              </a>
            </p>
          </address>
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/offer" className="text-accent hover:underline">
              Публичная оферта
            </Link>
            <Link href="/privacy" className="text-accent hover:underline">
              Политика конфиденциальности
            </Link>
            <Link href="/refund" className="text-accent hover:underline">
              Условия возврата
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-6">
            Не нашли ответ на свой вопрос? Напишите нам напрямую — ответим в ближайшее время.
          </p>
          <a
            href={getManagerLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent-hover text-accent-contrast font-bold px-8 py-3.5 rounded-md transition-colors inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Написать менеджеру
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
