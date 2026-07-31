'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { createWebOrder, getManagerLink } from '@/lib/api';
import { getClientRegion } from '@/lib/region';
import { clearPromo, loadPromo } from '@/lib/cart-promo';
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
  // Те же поля, что спрашивает Mini App: без них менеджер не сможет выдать игру.
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [psEmail, setPsEmail] = useState('');
  const [psPassword, setPsPassword] = useState('');
  const [promo, setPromo] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  // Скидку показываем только для кода, который сервер выдал этому браузеру, —
  // так в сумме не появится процент, которого на самом деле нет.
  const issued = loadPromo();
  const promoOk =
    !!issued && promo.trim().toUpperCase() === issued.code.toUpperCase();
  const discount = promoOk ? Math.round(totalPrice * issued.percent) / 100 : 0;
  const finalPrice = Math.round((totalPrice - discount) * 100) / 100;

  const canSubmit =
    !!name.trim() &&
    !!contact.trim() &&
    hasAccount !== null &&
    (hasAccount === false || !!psEmail.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

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
        account_type: hasAccount ? 'my_account' : 'no_account',
        ps_email: hasAccount ? psEmail.trim() : undefined,
        ps_password: hasAccount ? psPassword : undefined,
        promo_code: promo.trim() || undefined,
      });
      clearCart();
      clearPromo();
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
          href={getManagerLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors"
        >
          Написать менеджеру
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (status === 'fallback') {
    const orderSummary = items
      .map((i) => `${i.title}${i.edition_name ? ` (${i.edition_name})` : ''} × ${i.qty}`)
      .join('\n');
    const tgLink = getManagerLink(
      `Заказ:\n${orderSummary}\n\nИмя: ${name}\nКонтакт: ${contact}${comment ? `\nКомментарий: ${comment}` : ''}`
    );

    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
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
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors"
        >
          Отправить заказ менеджеру
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
          Аккаунт PlayStation <span className="text-accent">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: 'У меня есть' },
            { value: false, label: 'Нужен новый' },
          ].map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => setHasAccount(o.value)}
              className={clsx(
                'py-3 rounded-xl text-sm font-medium border transition-colors',
                hasAccount === o.value
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-border bg-bg-page text-text-secondary hover:text-text-primary'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {hasAccount === true && (
        <>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email от аккаунта PS <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              value={psEmail}
              onChange={(e) => setPsEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Пароль от аккаунта PS
            </label>
            <input
              type="password"
              value={psPassword}
              onChange={(e) => setPsPassword(e.target.value)}
              placeholder="Можно передать менеджеру лично"
              className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
            />
            <p className="text-text-secondary text-xs mt-1">
              Нужен, чтобы зайти в аккаунт и купить игру. Если не хотите вводить
              здесь — оставьте поле пустым, менеджер запросит его в переписке.
            </p>
          </div>
        </>
      )}

      {hasAccount === false && (
        <p className="text-text-secondary text-xs bg-bg-page border border-border rounded-xl px-4 py-3">
          Создадим для вас новый аккаунт и передадим данные вместе с игрой.
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Промокод
        </label>
        <input
          type="text"
          value={promo}
          onChange={(e) => setPromo(e.target.value.toUpperCase())}
          placeholder="Если есть"
          className="w-full px-4 py-3 bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-accent/50 transition-colors"
        />
        {promo.trim() && (
          <p className={clsx('text-xs mt-1', promoOk ? 'text-accent' : 'text-text-secondary')}>
            {promoOk
              ? `Скидка ${issued!.percent} % применена`
              : 'Код не найден — проверьте или оставьте поле пустым'}
          </p>
        )}
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
        {discount > 0 && (
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">Скидка по промокоду:</span>
            <span className="text-accent font-medium">−{discount} BYN</span>
          </div>
        )}
        <div className="flex justify-between text-sm mb-4">
          <span className="text-text-secondary">Итого:</span>
          <span className="text-text-primary font-bold text-lg">{finalPrice} BYN</span>
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !canSubmit}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all',
            status === 'loading' || !canSubmit
              ? 'bg-bg-card border border-border text-text-secondary cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-white'
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

        {/* Момент принятия оферты. Именно здесь покупатель передаёт нам свои
            данные и заключает договор, поэтому предупреждение должно стоять
            у кнопки, а не теряться в подвале. */}
        <p className="text-center text-text-secondary text-xs mt-3 leading-relaxed">
          Оформляя заказ, вы принимаете{' '}
          <Link href="/offer" className="text-accent hover:underline">
            публичную оферту
          </Link>{' '}
          и соглашаетесь с{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            политикой конфиденциальности
          </Link>
        </p>
      </div>
    </form>
  );
}
