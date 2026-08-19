'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tg-shop-production-1b03.up.railway.app/api/v1';

interface Props {
  /** Отзыв об игре. Не задан — отзыв о самом магазине. */
  productId?: number;
}

/**
 * Форма отзыва — об игре или о магазине.
 *
 * Одна форма на два случая намеренно: у них общий антиспам, общая ловушка для
 * ботов и общая модерация, и разъехаться они не должны. Отличаются только
 * адресом и парой подписей.
 */
export function ReviewForm({ productId }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [hp, setHp] = useState(''); // honeypot — заполняют только боты
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setErr('Укажите имя');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const url =
        productId != null
          ? `${API}/products/${productId}/reviews`
          : `${API}/store/reviews`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text: text.trim(),
          author_name: name.trim(),
          hp,
        }),
      });
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? 'Слишком много отзывов с вашего адреса. Попробуйте позже.'
            : res.status === 409
            ? productId != null
              ? 'Вы уже оставляли отзыв на эту игру.'
              : 'Вы уже оставляли отзыв о магазине.'
            : 'Не удалось отправить отзыв. Попробуйте ещё раз.'
        );
      }
      setDone(true);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-4 text-sm text-text-secondary">
        Спасибо! Ваш отзыв появится после проверки модератором.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
      >
        <Star className="w-4 h-4 fill-current" />
        {productId != null ? 'Оставить отзыв' : 'Оставить отзыв о покупке'}
      </button>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 max-w-lg">
      {/* Оценка */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            aria-label={`Оценка ${i}`}
            className="p-0.5"
          >
            <Star
              className={`w-7 h-7 ${i <= rating ? 'text-amber-400 fill-current' : 'text-text-secondary/40'}`}
            />
          </button>
        ))}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        maxLength={80}
        className="w-full mb-2 rounded-lg bg-bg-page border border-border px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          productId != null
            ? 'Ваше впечатление об игре (необязательно)'
            : 'Как прошла покупка: сколько ждали, всё ли заработало (необязательно)'
        }
        maxLength={2000}
        rows={3}
        className="w-full mb-2 rounded-lg bg-bg-page border border-border px-3 py-2 text-sm text-text-primary outline-none focus:border-accent resize-y"
      />

      {/* Honeypot: скрыт от людей, боты его заполняют */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      {err && <p className="text-red-400 text-sm mb-2">{err}</p>}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
        >
          {busy ? 'Отправка…' : 'Отправить'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
