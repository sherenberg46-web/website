'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import clsx from 'clsx';

const FAQS = [
  {
    q: 'Как быстро я получу код после оплаты?',
    a: 'Обычно менеджер связывается и отправляет код в течение 15–30 минут после оформления заказа. В рабочее время (10:00–22:00) — значительно быстрее.',
  },
  {
    q: 'Для какого региона PlayStation подходят ваши игры?',
    a: 'Мы продаём коды для украинского (UA) и других регионов PlayStation Store. Перед покупкой убедитесь, что ваш аккаунт соответствует региону игры.',
  },
  {
    q: 'Что делать, если код не работает?',
    a: 'Напишите нам в Telegram с описанием проблемы. Мы разберёмся и либо вышлем новый код, либо вернём деньги — гарантируем.',
  },
  {
    q: 'Можно ли вернуть деньги за игру?',
    a: 'Если код не работает по нашей вине — возвращаем деньги. Если код уже был активирован — возврат невозможен. Это стандартная политика для цифровых товаров.',
  },
  {
    q: 'Как оплатить заказ?',
    a: 'После оформления заказа менеджер свяжется с вами в Telegram и уточнит удобный способ оплаты: банковская карта, электронные кошельки и другие варианты.',
  },
  {
    q: 'Есть ли скидки постоянным покупателям?',
    a: 'Да! Постоянные клиенты получают специальные предложения в нашем Telegram-боте. Подпишитесь, чтобы первыми узнавать об акциях.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <ScrollReveal delay={index * 0.05}>
      <div className="border-b border-border">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full py-5 text-left gap-4"
        >
          <span className={clsx('font-medium transition-colors', open ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary')}>
            {q}
          </span>
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-text-secondary shrink-0 transition-transform duration-300',
              open && 'rotate-180 text-accent'
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="text-text-secondary text-sm leading-relaxed pb-5 pr-8">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
}

export function FAQ() {
  return (
    <section className="section-pad">
      <div className="max-w-3xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-center text-text-secondary mb-12">
            Не нашли ответ? Напишите нам в Telegram — ответим быстро.
          </p>
        </ScrollReveal>

        <div className="border-t border-border">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} {...faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
