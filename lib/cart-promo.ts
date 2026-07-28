/**
 * Промокод за брошенную корзину — хранение на стороне браузера.
 *
 * Почему так, а не как в Telegram: в Mini App корзина лежит на сервере и
 * привязана к telegram_id, поэтому планировщик сам находит брошенные и шлёт
 * код ботом. На сайте корзина живёт в localStorage, сервер о ней не знает, а
 * канала для сообщения нет — почту мы не собираем, а бот не может написать
 * первым тому, кто его не запускал.
 *
 * Поэтому отсчёт ведёт сам браузер: как только товары пролежали в корзине
 * 30 минут, сайт просит у сервера настоящий код и показывает предложение.
 * Код здесь только кэшируется, чтобы пережить перезагрузку страницы —
 * источник истины всё равно сервер, он же его и погасит после применения.
 */
import type { CartPromo } from './types';

const KEY = 'gamestore-cart-promo';
/** Сколько корзина должна пролежать нетронутой, прежде чем предложить скидку. */
export const IDLE_MINUTES = 30;

export interface StoredPromo extends CartPromo {
  /** Момент истечения в миллисекундах — по нему считаем обратный отсчёт. */
  expiresAtMs: number;
}

export function loadPromo(): StoredPromo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const promo = JSON.parse(raw) as StoredPromo;
    // Протухший код молча выбрасываем: показывать таймер на нуле незачем.
    if (!promo?.code || promo.expiresAtMs <= Date.now()) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return promo;
  } catch {
    return null;
  }
}

export function savePromo(promo: CartPromo): StoredPromo {
  const stored: StoredPromo = {
    ...promo,
    expiresAtMs: Date.now() + promo.minutes * 60_000,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Приватный режим или переполненное хранилище — код всё равно вернём,
    // просто он не переживёт перезагрузку.
  }
  return stored;
}

export function clearPromo(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* не критично */
  }
}

/** Остаток в формате мм:сс. */
export function formatLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
