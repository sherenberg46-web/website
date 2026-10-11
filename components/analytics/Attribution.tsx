'use client';

import { useEffect } from 'react';
import { botStartParam, captureVisit } from '@/lib/attribution';

/** Путь бота в ссылках t.me — из той же переменной, что и getTelegramLink() */
const BOT_PATH = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_TG_BOT || 'https://t.me/GameDigitalShop_bot');
    return url.pathname.replace(/\/+$/, '').toLowerCase();
  } catch {
    return '/gamedigitalshop_bot';
  }
})();

/**
 * Источник визита + метка в ссылках на бота.
 *
 * Ссылки на бота рендерятся на сервере (шапка, футер, главная, корзина,
 * контакты), а источник лежит в браузере. Поэтому метку дописываем в момент
 * клика: один слушатель на весь сайт, как у пикселя Meta.
 * Трогаем только ссылки на бота без параметров. Ссылки с ?start= (чат с сайта,
 * web-…) и ?startapp= (товары) не меняются; личка менеджера — тоже.
 */
export function Attribution() {
  useEffect(() => {
    captureVisit();

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href*="t.me"]');
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (url.hostname !== 't.me') return;
      if (url.pathname.replace(/\/+$/, '').toLowerCase() !== BOT_PATH) return;
      if (url.searchParams.has('start') || url.searchParams.has('startapp')) return;
      url.searchParams.set('start', botStartParam());
      link.href = url.toString();
    }

    // Фаза перехвата: адрес меняется до того, как браузер начнёт переход
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}
