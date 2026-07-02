'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createWebOrder, getTelegramLink } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'fallback';

export function OrderForm() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setStatus('loading');
    setError('');

    try {
      await createWebOrder({
        items: items.map((i) => ({
          product_id: i.product_id,
          edition_id: i.edition_id,
          qty: i.qty,
        })),
        name: name.trim(),
        contact: contact.trim(),
        comment: comment.trim() || undefined,
        region: getClientRegion(),
      });
      clearCart();
      setStatus('success');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 404 || status === 405) {
        // Endpoint not deployed yet — show Telegram fallback
        setStatus('fallback');
      } else {
        setError('Произошла ошибка. Попробуйте ещё раз или напишите в Telegram.');
        setStatus('error');
      }
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Заказ принят!</h2>
        <p className="text-text-secondary mb-6">
          Менеджер свяжется с вами в ближайшее время для подтверждения заказа и оплаты.
        </p>
        <a
          href={getTelegramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 btn-gradient text-black font-semibold px-8 py-3.5 rounded-full"
        >
          Написать в Telegram
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (status === 'fallback') {
    const orderSummary = items
      .map((i) => `${i.title}${i.edition_name ? ` (${i.edition_name})` : ''} × ${i.qty}`)
      .join('\n');
    const tgText = encodeURIComponent(
      `Заказ:\n${orderSummary}\n\nИмя: ${name}\nКонтакт: ${contact}${comment ? `\nКомментарий: ${comment}` : ''}`
    );
    const tgLink = `https://t.me/GameDigitalShop_bot?text=${tgText}`;

    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.196 13.98l-2.948-.924c-.64-.203-.653-.64.136-.954l11.52-4.44c.534-.194 1.003.13.99.559z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Оформить через Telegram</h2>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          Нажмите кнопку ниже — мы предзаполним сообщение с вашим заказом, остаётся только отправить.
        </p>
        <a
          href={tgLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 btn-gradient text-black font-semibold px-8 py-3.5 rounded-full"
        >
          Отправить заказ в Telegram
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-6">Оформить заказ</h2>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Ваше имя <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Иван"
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Telegram или телефон <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          placeholder="@username или +375XXXXXXXXX"
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
        />
        <p className="text-text-secondary text-xs mt-1">
          Укажите хотя бы один способ связи
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Комментарий (необязательно)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Уточнения по заказу..."
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="pt-2">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-text-secondary">Итого:</span>
          <span className="text-text-primary font-bold text-lg">{totalPrice} BYN</span>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !name.trim() || !contact.trim()}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all',
            status === 'loading' || !name.trim() || !contact.trim()
              ? 'bg-bg-card border border-border text-text-secondary cursor-not-allowed'
              : 'btn-gradient text-black'
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Отправляем...
            </>
          ) : (
            'Оформить заказ'
          )}
        </button>

        <p className="text-center text-text-secondary text-xs mt-3">
          Оплата — после подтверждения заказа менеджером
        </p>
      </div>
    </form>
  );
}
