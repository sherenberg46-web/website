/**
 * Пополнение Steam по логину.
 *
 * Клиент выбирает сумму, оформляет заказ и называет логин аккаунта Steam, а
 * менеджер пополняет кошелёк. Пароль, почта и код Steam Guard не нужны.
 *
 * Цена = сумма в долларах × 3,9078 BYN, округление вверх до рубля. Это курс,
 * по которому пополнение продаёт belkod.by (19,54 / 39,08 / 97,70 / 195,39 /
 * 390,78 за $5 / $10 / $25 / $50 / $100), закупку он не учитывает: перед
 * запуском сверить со своим поставщиком.
 *
 * Итог заказа считает сервер по своей базе, поэтому цены здесь обязаны
 * совпадать с price_byn товаров в базе (их заводит миграция _seed_steam в
 * backend/database.py бэкенда).
 */
export interface SteamOffer {
  usd: number;
  price: number;
  productId: number;
}

export const STEAM_OFFERS: SteamOffer[] = [
  { usd: 5, price: 20, productId: 98152 },
  { usd: 10, price: 40, productId: 98153 },
  { usd: 25, price: 98, productId: 98154 },
  { usd: 50, price: 196, productId: 98155 },
  { usd: 100, price: 391, productId: 98156 },
];

export const STEAM_IMAGE = '/images/steam-topup.jpg';
export const STEAM_IMAGE_WIDE = '/images/steam-topup-wide.jpg';

/** Больше этой суммы Steam не даёт пополнить один логин за сутки. */
export const STEAM_DAILY_LIMIT_USD = 500;

export function steamTitle(usd: number): string {
  return `Пополнение Steam на $${usd} (по логину)`;
}

/** ID товаров Steam в корзине — по ним форма заказа просит логин. */
export function steamOfferById(productId: number): SteamOffer | undefined {
  return STEAM_OFFERS.find((o) => o.productId === productId);
}
