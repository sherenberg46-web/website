/**
 * Случайный ключ браузера — чтобы считать уникальных посетителей.
 *
 * Полка «популярное» опирается на то, что люди смотрят и заказывают. В
 * Telegram-приложении личность подтверждена подписью, и просмотры считались
 * всегда. На сайте подписи нет, и просмотры не считались вовсе: главная
 * показывала «популярное», ничего не зная о том, что смотрят на самом сайте.
 *
 * Ключ ничего не говорит о человеке — это случайное число, живущее в его же
 * браузере. Нужно оно ровно для одного: чтобы один посетитель, десять раз
 * открывший карточку, не выглядел как десять разных людей.
 */
const KEY = 'gamestore-guest';

export function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(KEY) ?? '';
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Приватный режим — просмотр просто не посчитается, это не повод падать.
    return '';
  }
}
