'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PLUS5_CODE, PLUS5_UNTIL, plus5Active, plus5Available } from '@/lib/plus5';

const HIDE_KEY = 'gamestore-plus5-strip-hidden';

/**
 * Полоса анонса акции PLUS5 над шапкой.
 *
 * Показывается, только пока акция жива и браузер ещё не использовал код —
 * человеку, уже получившему скидку, крутить анонс бессмысленно. Крестик
 * запоминается в localStorage, чтобы полоса не надоедала.
 *
 * Рендер только на клиенте (после монтирования): решение зависит от
 * localStorage, а на сервере его нет — иначе был бы mismatch гидратации.
 */
export function PromoStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = !!window.localStorage.getItem(HIDE_KEY);
    } catch {
      /* приватный режим — просто показываем */
    }
    setVisible(plus5Active() && plus5Available() && !hidden);
  }, []);

  if (!visible) return null;

  const until = new Date(PLUS5_UNTIL).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  function hide() {
    try {
      window.localStorage.setItem(HIDE_KEY, '1');
    } catch {
      /* не критично */
    }
    setVisible(false);
  }

  return (
    <div className="bg-accent text-accent-contrast">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
        <p className="text-center">
          Скидка 5 % на первую покупку по промокоду{' '}
          <span className="font-bold tracking-wide">{PLUS5_CODE}</span>
          <span className="hidden sm:inline"> — только до {until}</span>
        </p>
        <button
          onClick={hide}
          aria-label="Скрыть"
          className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
