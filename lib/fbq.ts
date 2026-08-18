/**
 * Отправка событий в пиксель Meta.
 *
 * Пиксель грузится асинхронно и только если задан NEXT_PUBLIC_FB_PIXEL_ID,
 * поэтому перед каждой отправкой проверяем, что fbq на странице реально
 * появился. Без проверки код падал бы при серверном рендере и в дев-режиме
 * без переменной окружения.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function fbTrack(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}
