/**
 * Xbox Game Pass Ultimate.
 *
 * Два способа выдачи:
 *  • own — на аккаунт покупателя: он даёт вход в аккаунт Microsoft, мы
 *    оформляем подписку. На аккаунте не должно быть активной подписки.
 *  • new — на новый аккаунт: заводим его сами и передаём данные. Дешевле.
 *
 * Сроки — те, что есть у поставщиков. Основной — plati.market/itm/5081832;
 * сроков, которых у него нет (свой аккаунт: 5, 7, 9, 10; новый: 1, 3), —
 * plati.market/itm/3747603. Новый аккаунт на 11 месяцев нет ни у одного.
 * Цены = закупка × 1,2 × 1,05 (наценка 20 % и ещё 5 % сверху) по курсу НБРБ
 * на 23.09.2026 (3,5986 BYN за 100 RUB), округление вверх до рубля.
 *
 * Итог заказа считает сервер по своей базе, поэтому цены здесь обязаны
 * совпадать с price_byn товаров в базе (их заводит миграция _seed_gamepass в
 * backend/database.py бэкенда). productId === null — товар не заведён:
 * карточка видна, купить нельзя.
 */
export type GamePassAccount = 'own' | 'new';

export interface GamePassOffer {
  account: GamePassAccount;
  months: number;
  price: number;
  productId: number | null;
}

export const GAMEPASS_OFFERS: GamePassOffer[] = [
  { account: 'own', months: 1, price: 44, productId: 97687 },
  { account: 'own', months: 2, price: 87, productId: 97688 },
  { account: 'own', months: 3, price: 105, productId: 97689 },
  { account: 'own', months: 4, price: 132, productId: 97690 },
  { account: 'own', months: 5, price: 173, productId: 97691 },
  { account: 'own', months: 6, price: 182, productId: 97692 },
  { account: 'own', months: 7, price: 200, productId: 97693 },
  { account: 'own', months: 8, price: 227, productId: 97694 },
  { account: 'own', months: 9, price: 236, productId: 97695 },
  { account: 'own', months: 10, price: 283, productId: 97696 },
  { account: 'own', months: 11, price: 295, productId: 97697 },
  { account: 'own', months: 12, price: 322, productId: 97698 },

  { account: 'new', months: 1, price: 46, productId: 97699 },
  { account: 'new', months: 2, price: 59, productId: 97700 },
  { account: 'new', months: 3, price: 91, productId: 97701 },
  { account: 'new', months: 4, price: 102, productId: 97702 },
  { account: 'new', months: 5, price: 139, productId: 97703 },
  { account: 'new', months: 6, price: 140, productId: 97704 },
  { account: 'new', months: 7, price: 182, productId: 97705 },
  { account: 'new', months: 8, price: 186, productId: 97706 },
  { account: 'new', months: 9, price: 241, productId: 97707 },
  { account: 'new', months: 10, price: 245, productId: 97708 },
  { account: 'new', months: 12, price: 279, productId: 97709 },
];

export const GAMEPASS_ACCOUNTS: { id: GamePassAccount; label: string; hint: string }[] = [
  {
    id: 'own',
    label: 'На мой аккаунт',
    hint: 'Оформим подписку на ваш аккаунт Microsoft. На нём не должно быть активной подписки.',
  },
  {
    id: 'new',
    label: 'Новый аккаунт',
    hint: 'Создадим новый аккаунт Microsoft с подпиской и передадим вам данные. Обычно дешевле.',
  },
];

export const GAMEPASS_IMAGE = '/images/gamepass-ultimate.jpg';
export const GAMEPASS_IMAGE_WIDE = '/images/gamepass-ultimate-wide.jpg';

export function gamePassTitle(o: Pick<GamePassOffer, 'account' | 'months'>): string {
  const acc = o.account === 'own' ? 'на ваш аккаунт' : 'новый аккаунт';
  return `Xbox Game Pass Ultimate — ${monthsWord(o.months)} (${acc})`;
}

export function monthsWord(m: number): string {
  const d10 = m % 10;
  const d100 = m % 100;
  const w =
    d10 === 1 && d100 !== 11
      ? 'месяц'
      : d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)
        ? 'месяца'
        : 'месяцев';
  return `${m} ${w}`;
}

/** ID товаров Game Pass в корзине — по ним форма заказа узнаёт Xbox. */
export function gamePassOfferById(productId: number): GamePassOffer | undefined {
  return GAMEPASS_OFFERS.find((o) => o.productId === productId);
}
