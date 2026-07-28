'use client';

import { useCallback, useEffect, useState } from 'react';
import { Timer, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { issueCartPromo } from '@/lib/api';
import {
  IDLE_MINUTES,
  clearPromo,
  formatLeft,
  loadPromo,
  savePromo,
  type StoredPromo,
} from '@/lib/cart-promo';

/**
 * Предложение скидки 5 % за брошенную корзину.
 *
 * В Mini App это делает планировщик: корзина лежит на сервере, привязана к
 * telegram_id, и бот пишет покупателю через 30 минут. На сайте так нельзя —
 * корзина живёт в localStorage, а канала для сообщения нет: почту мы не
 * собираем, а бот не может написать первым тому, кто его не запускал.
 *
 * Поэтому отсчёт ведёт браузер, а предложение показывает сама страница. Код
 * при этом настоящий: его выдаёт сервер и он же гасит его после применения.
 */
export function CartPromoBanner() {
  const items = useCartStore((s) => s.items);
  const updatedAt = useCartStore((s) => s.updatedAt);

  const [promo, setPromo] = useState<StoredPromo | null>(null);
  const [left, setLeft] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Уже выданный код переживает перезагрузку страницы.
  useEffect(() => {
    setPromo(loadPromo());
  }, []);

  const request = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      setPromo(savePromo(await issueCartPromo()));
    } catch {
      // Сервер не ответил — просто не показываем предложение.
      // Ошибку не выводим: это не то, ради чего человек пришёл.
    } finally {
      setRequesting(false);
    }
  }, [requesting]);

  // Корзина пролежала нетронутой достаточно долго — просим код.
  useEffect(() => {
    if (promo || !items.length || !updatedAt) return;

    const due = updatedAt + IDLE_MINUTES * 60_000;
    const wait = due - Date.now();
    if (wait <= 0) {
      void request();
      return;
    }
    const t = setTimeout(() => void request(), wait);
    return () => clearTimeout(t);
  }, [items.length, updatedAt, promo, request]);

  // Обратный отсчёт.
  useEffect(() => {
    if (!promo) return;
    const tick = () => {
      const ms = promo.expiresAtMs - Date.now();
      setLeft(ms);
      if (ms <= 0) {
        clearPromo();
        setPromo(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [promo]);

  if (!promo || hidden || !items.length || left <= 0) return null;

  return (
    <div className="relative mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Скрыть предложение"
        className="absolute right-3 top-3 text-text-secondary transition-colors hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Timer className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">
            Скидка {promo.percent} % на этот заказ
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Введите промокод{' '}
            <code className="rounded bg-bg-page px-1.5 py-0.5 font-mono text-text-primary">
              {promo.code}
            </code>{' '}
            в форме заказа. Действует{' '}
            <span className="font-semibold text-accent" suppressHydrationWarning>
              {formatLeft(left)}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
