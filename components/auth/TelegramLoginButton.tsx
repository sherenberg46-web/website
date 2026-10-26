'use client';

import { useEffect, useRef, useState } from 'react';
import { loginWithTelegram, type TelegramAuthData } from '@/lib/site-auth';

/**
 * Официальная кнопка «Войти через Telegram» (Telegram Login Widget).
 *
 * Работает только на домене, привязанном к боту в BotFather (/setdomain →
 * gamesstore.by). На localhost и других доменах Telegram показывает
 * «Bot domain invalid» — это нормально.
 *
 * request-access="write" — разрешение боту писать клиенту: так дойдёт
 * сообщение о начислении баллов, даже если человек ни разу не запускал бота.
 */
const BOT =
  (process.env.NEXT_PUBLIC_TG_BOT || 'https://t.me/GameDigitalShop_bot')
    .replace(/\/+$/, '')
    .split('/')
    .pop() || 'GameDigitalShop_bot';

declare global {
  interface Window {
    gamestoreOnTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

export function TelegramLoginButton({ onDone }: { onDone?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  // Колбэк через ref: иначе виджет пересоздавался бы на каждый рендер родителя
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    window.gamestoreOnTelegramAuth = async (user) => {
      setError('');
      try {
        await loginWithTelegram(user);
        done.current?.();
      } catch {
        setError('Не удалось войти. Попробуйте ещё раз.');
      }
    };
    const el = box.current;
    if (!el) return;
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', BOT);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '10');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-onauth', 'gamestoreOnTelegramAuth(user)');
    el.appendChild(s);
    return () => {
      el.innerHTML = '';
    };
  }, []);

  return (
    <div>
      <div ref={box} className="flex min-h-[40px] justify-center" />
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
