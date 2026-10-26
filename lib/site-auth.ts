'use client';

import { useCallback, useEffect, useState } from 'react';
import { API_BASE } from './api';

/**
 * Вход на сайт через Telegram и баллы лояльности.
 *
 * Баллы привязаны к Telegram ID — тому же, что в Mini App, поэтому баланс у
 * клиента один на сайт и приложение. Вход по желанию: гостевой заказ работает
 * как раньше, просто без баллов.
 *
 * Сессию выдаёт сервер после проверки подписи Telegram (POST /loyalty/site-login)
 * и хранит браузер в localStorage. Сервер сессию не помнит — она подписана.
 */
const KEY = 'gamestore-tg-session';
const EVENT = 'gamestore-auth';

export interface SiteUser {
  id: number;
  first_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
}

interface Stored {
  session: string;
  user: SiteUser;
}

export interface LoyaltyEntry {
  delta: number;
  reason: string;
  order_id: number | null;
  created_at: string;
}

export interface Loyalty {
  balance: number;
  welcome_left: number;
  welcome_min_order_byn: number | null;
  points_per_byn: number;
  earn_step_byn: number;
  max_spend_share: number;
  /** Последние движения баллов (сервер отдаёт до 20) */
  history?: LoyaltyEntry[];
}

/** Заказ для личного кабинета — без реквизитов аккаунтов. */
export interface AccountOrder {
  id: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | string;
  total_byn: number;
  created_at: string;
  points_spent: number;
  points_earned: number;
  source: string;
  items: Array<{
    product_id: number;
    title: string;
    image_url: string | null;
    platform: string | null;
    quantity: number;
    price_paid: number;
    region: string;
  }>;
}

/** Данные, которые отдаёт Telegram Login Widget в колбэк. */
export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function loadAuth(): Stored | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null; // приватный режим — просто не вошли
  }
}

function saveAuth(v: Stored | null) {
  try {
    if (v) window.localStorage.setItem(KEY, JSON.stringify(v));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* приватный режим */
  }
  // Шапка и корзина слушают это событие и обновляются вместе
  window.dispatchEvent(new Event(EVENT));
}

export function getSession(): string | null {
  return loadAuth()?.session ?? null;
}

export function logout() {
  saveAuth(null);
}

/** Обменять данные виджета на сессию сайта. */
export async function loginWithTelegram(data: TelegramAuthData): Promise<void> {
  const res = await fetch(`${API_BASE}/loyalty/site-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as Stored;
  saveAuth({ session: body.session, user: body.user });
}

async function fetchLoyalty(session: string): Promise<Loyalty | null> {
  try {
    const res = await fetch(`${API_BASE}/loyalty/me`, {
      headers: { 'X-Site-Session': session },
      cache: 'no-store',
    });
    if (res.status === 401) {
      // Сессия истекла — выходим, чтобы не показывать устаревший баланс
      saveAuth(null);
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return data?.enabled ? (data as Loyalty) : null;
  } catch {
    return null; // баллы — не повод ломать шапку или корзину
  }
}

/** Текущий вход и баланс. Обновляется при входе/выходе в любом месте сайта. */
export function useSiteLoyalty() {
  const [auth, setAuth] = useState<Stored | null>(null);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);

  const refresh = useCallback(async () => {
    const a = loadAuth();
    setAuth(a);
    setLoyalty(a ? await fetchLoyalty(a.session) : null);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);

  return { user: auth?.user ?? null, session: auth?.session ?? null, loyalty, refresh };
}

/** Заказы клиента (из бота и с сайта). null — не удалось загрузить. */
export async function fetchAccountOrders(session: string): Promise<AccountOrder[] | null> {
  try {
    const res = await fetch(`${API_BASE}/loyalty/orders`, {
      headers: { 'X-Site-Session': session },
      cache: 'no-store',
    });
    if (res.status === 401) {
      saveAuth(null);
      return null;
    }
    return res.ok ? ((await res.json()) as AccountOrder[]) : null;
  } catch {
    return null;
  }
}

/** Подпись строки истории баллов. */
export function entryLabel(e: LoyaltyEntry): string {
  const n = e.order_id ? ` #${e.order_id}` : '';
  switch (e.reason) {
    case 'welcome':
      return 'Стартовый бонус';
    case 'earn':
      return `Начислено за заказ${n}`;
    case 'earn_revert':
      return `Отмена заказа${n}`;
    case 'spend':
    case 'spend_welcome':
      return `Оплата заказа${n}`;
    case 'spend_revert':
    case 'spend_welcome_revert':
      return `Возврат баллов, заказ${n}`;
    default:
      return e.delta > 0 ? 'Начисление от магазина' : 'Списание магазином';
  }
}

/** Сколько баллов принесёт покупка товара по этой цене (1 балл за каждые 10 BYN). */
export function pointsForPrice(price: number | null | undefined): number {
  return price && price > 0 ? earnPoints(price) : 0;
}

/** Сколько баллов можно списать (копия spend_limit с сервера — только для показа). */
export function spendLimit(l: Loyalty, orderTotal: number): number {
  const cap = Math.floor(Math.round(orderTotal * l.max_spend_share * l.points_per_byn * 1e6) / 1e6);
  const earned = Math.max(l.balance - l.welcome_left, 0);
  const welcomeOk = l.welcome_left > 0 && orderTotal >= (l.welcome_min_order_byn ?? 0);
  return Math.max(Math.min(earned + (welcomeOk ? l.welcome_left : 0), cap), 0);
}

/** Баллы за сумму, оплаченную деньгами: 1 балл за каждые полные 10 BYN. */
export function earnPoints(paidByn: number, stepByn = 10): number {
  return paidByn > 0 ? Math.floor(Math.round(paidByn * 100) / 100 / stepByn) : 0;
}

/** Баллы → BYN с копейками: 15 → «1,50». */
export function pointsToByn(points: number, perByn = 10): string {
  return (points / perByn).toFixed(2).replace('.', ',');
}

/** Сумма в BYN: целая — «55», дробная — «17,50». */
export function formatSum(byn: number): string {
  const v = Math.round(byn * 100) / 100;
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',');
}

export function pluralPoints(n: number): string {
  const m = Math.abs(n) % 100;
  if (m >= 11 && m <= 14) return 'баллов';
  const d = m % 10;
  return d === 1 ? 'балл' : d >= 2 && d <= 4 ? 'балла' : 'баллов';
}
