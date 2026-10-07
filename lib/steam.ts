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
  /** Курс: BYN за единицу валюты кошелька. Тот же, что STEAM_RATES на сервере. */
  rate: number;
  /** Границы произвольной суммы (целые числа): STEAM_CUSTOM_RANGE на сервере. */
  min: number;
  max: number;
  /** Товар-заготовка «своя сумма»: позиция ссылается на него, сумма — в edition_id. */
  customProductId: number;
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
    rate: 3.9078,
    min: 2,
    max: 500,
    customProductId: 98172,
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
    rate: 0.045635,
    min: 100,
    max: 35000,
    customProductId: 98173,
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
    rate: 0.008649,
    min: 500,
    max: 200000,
    customProductId: 98174,
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
    rate: 0.087068,
    min: 60,
    max: 20000,
    customProductId: 98175,
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

/**
 * Цена в BYN за любую целую сумму; null — сумма вне границ региона.
 *
 * Округление вверх, как у всех цен магазина. Math.ceil(сумма × курс) даёт то
 * же, что math.ceil на сервере (steam_custom_price): те же числа с плавающей
 * точкой, поэтому цена на экране не расходится с ценой в заказе.
 */
export function steamCustomPrice(region: SteamRegion, amount: number): number | null {
  if (!Number.isInteger(amount) || amount < region.min || amount > region.max) return null;
  return Math.ceil(amount * region.rate);
}

/**
 * Позиция корзины на произвольную сумму кодирует её в edition_id: −1500 — это
 * 1 500 в валюте кошелька. Настоящие издания всегда с положительным id, так
 * что путаницы нет; корзина при этом различает суммы без правок в хранилище.
 */
export function customEditionId(amount: number): number {
  return -amount;
}

/** Позиция на произвольную сумму: такую корзина не сверяет с каталогом по id издания. */
export function isCustomEdition(editionId: number | null): boolean {
  return editionId != null && editionId < 0;
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

/**
 * Регион кошелька по ID товара в корзине — по нему форма заказа узнаёт Steam
 * и просит логин. Узнаёт и готовые суммы, и «заготовки» произвольной.
 */
export function steamRegionByProductId(productId: number): SteamRegion | undefined {
  return STEAM_REGIONS.find(
    (r) => r.customProductId === productId || r.offers.some((o) => o.productId === productId)
  );
}
