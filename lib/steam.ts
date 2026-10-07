/**
 * Пополнение Steam по логину.
 *
 * Клиент выбирает регион кошелька своего аккаунта и сумму, оформляет заказ и
 * называет логин Steam, а менеджер пополняет кошелёк. Пароль, почта и код
 * Steam Guard не нужны.
 *
 * Регион — это валюта кошелька: СНГ (доллары), Россия (₽), Казахстан (₸),
 * Украина (₴). У каждого региона свои пять сумм и свой курс. Цена = сумма ×
 * курс региона, округление вверх до рубля. Курсы — те, по которым пополнение
 * продаёт belkod.by (BYN за 1 доллар / ₽ / ₸ / ₴: 3,9078 / 0,045635 /
 * 0,008649 / 0,087068); закупку они не учитывают: перед запуском сверить со
 * своим поставщиком.
 *
 * Итог заказа считает сервер по своей базе, поэтому цены здесь обязаны
 * совпадать с price_byn товаров в базе (их заводит миграция _seed_steam в
 * backend/database.py бэкенда, там же — названия товаров).
 */
export type SteamRegionId = 'cis' | 'ru' | 'kz' | 'ua';

export interface SteamOffer {
  region: SteamRegionId;
  /** Сумма в валюте кошелька: доллары, ₽, ₸ или ₴. */
  amount: number;
  price: number;
  productId: number;
}

export interface SteamRegion {
  id: SteamRegionId;
  label: string;
  /** Знак валюты кошелька. */
  currency: string;
  /** Знак ставится перед суммой ($5), а не после (300 ₽). */
  currencyFirst: boolean;
  /** Сколько можно пополнить один логин за 24 часа, в валюте кошелька. */
  dailyLimit: number;
  /** Сумма, выбранная по умолчанию. */
  defaultAmount: number;
  offers: SteamOffer[];
}

function offers(region: SteamRegionId, rows: [amount: number, price: number, productId: number][]): SteamOffer[] {
  return rows.map(([amount, price, productId]) => ({ region, amount, price, productId }));
}

export const STEAM_REGIONS: SteamRegion[] = [
  {
    id: 'cis',
    label: 'СНГ',
    currency: '$',
    currencyFirst: true,
    dailyLimit: 500,
    defaultAmount: 25,
    offers: offers('cis', [
      [5, 20, 98152],
      [10, 40, 98153],
      [25, 98, 98154],
      [50, 196, 98155],
      [100, 391, 98156],
    ]),
  },
  {
    id: 'ru',
    label: 'Россия',
    currency: '₽',
    currencyFirst: false,
    dailyLimit: 35000,
    defaultAmount: 1000,
    offers: offers('ru', [
      [300, 14, 98157],
      [500, 23, 98158],
      [1000, 46, 98159],
      [2000, 92, 98160],
      [5000, 229, 98161],
    ]),
  },
  {
    id: 'kz',
    label: 'Казахстан',
    currency: '₸',
    currencyFirst: false,
    dailyLimit: 200000,
    defaultAmount: 10000,
    offers: offers('kz', [
      [2000, 18, 98162],
      [5000, 44, 98163],
      [10000, 87, 98164],
      [20000, 173, 98165],
      [50000, 433, 98166],
    ]),
  },
  {
    id: 'ua',
    label: 'Украина',
    currency: '₴',
    currencyFirst: false,
    dailyLimit: 20000,
    defaultAmount: 1000,
    offers: offers('ua', [
      [300, 27, 98167],
      [500, 44, 98168],
      [1000, 88, 98169],
      [2000, 175, 98170],
      [5000, 436, 98171],
    ]),
  },
];

export const STEAM_IMAGE = '/images/steam-topup.jpg';
export const STEAM_IMAGE_WIDE = '/images/steam-topup-wide.jpg';

export function getSteamRegion(id: SteamRegionId): SteamRegion {
  return STEAM_REGIONS.find((r) => r.id === id) ?? STEAM_REGIONS[0];
}

/** «$25», «1 000 ₽» — сумма со знаком валюты региона. */
export function steamMoney(region: SteamRegion, amount: number): string {
  // Группировку делаем сами: toLocaleString ставит узкий неразрывный пробел,
  // а в названии товара из базы пробел обычный — заголовки разошлись бы.
  const n = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return region.currencyFirst ? `${region.currency}${n}` : `${n} ${region.currency}`;
}

/** Название товара — то же, что в базе (_steam_title в backend/database.py). */
export function steamTitle(offer: Pick<SteamOffer, 'region' | 'amount'>): string {
  const r = getSteamRegion(offer.region);
  return `Пополнение Steam ${r.label} на ${steamMoney(r, offer.amount)} (по логину)`;
}

/** Самая низкая цена среди всех регионов — для «от N BYN». */
export const STEAM_MIN_PRICE = Math.min(
  ...STEAM_REGIONS.flatMap((r) => r.offers.map((o) => o.price))
);

/** ID товаров Steam в корзине — по ним форма заказа просит логин. */
export function steamOfferById(productId: number): SteamOffer | undefined {
  for (const r of STEAM_REGIONS) {
    const o = r.offers.find((x) => x.productId === productId);
    if (o) return o;
  }
  return undefined;
}
