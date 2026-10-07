/**
 * Платформы магазина и их разделы.
 *
 * Сайт делится на витрины: PlayStation — весь каталог, как был; Xbox — пока
 * одна подписка Game Pass Ultimate. Steam и Nintendo добавятся сюда же одной
 * записью: переключатель в шапке, навигация и мобильное меню читают этот
 * список, а не держат свой.
 */
export type PlatformId = 'playstation' | 'xbox' | 'steam';

export interface Platform {
  id: PlatformId;
  label: string;
  /** Главная витрины — куда ведёт переключатель и логотип. */
  home: string;
  /** Пути, которые принадлежат только этой платформе. */
  prefixes: string[];
  /** Разделы для шапки и мобильного меню. */
  nav: readonly { href: string; label: string }[];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'playstation',
    label: 'PlayStation',
    home: '/',
    prefixes: [
      '/games', '/sale', '/new', '/preorders', '/subscriptions', '/ea-play',
      '/topup', '/collections', '/guides',
    ],
    nav: [
      { href: '/games', label: 'Каталог' },
      { href: '/sale', label: 'Распродажа' },
      { href: '/new', label: 'Новинки' },
      { href: '/preorders', label: 'Предзаказы' },
      { href: '/subscriptions', label: 'Подписки' },
      { href: '/ea-play', label: 'EA Play' },
      { href: '/topup', label: 'Пополнение' },
      { href: '/guides', label: 'Гайды' },
    ],
  },
  {
    id: 'xbox',
    label: 'Xbox',
    home: '/xbox',
    prefixes: ['/xbox'],
    nav: [{ href: '/xbox', label: 'Game Pass Ultimate' }],
  },
  {
    id: 'steam',
    label: 'Steam',
    home: '/steam',
    prefixes: ['/steam'],
    nav: [{ href: '/steam', label: 'Пополнение Steam' }],
  },
];

export const DEFAULT_PLATFORM: PlatformId = 'playstation';

export function getPlatform(id: PlatformId): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

/**
 * Платформа, которой принадлежит путь, либо null для общих страниц.
 *
 * Корзина, контакты, оферта и прочее — общие: на них шапка остаётся в той
 * витрине, из которой пришёл покупатель. Иначе, зайдя с Xbox в корзину, он
 * внезапно видел бы навигацию PlayStation.
 */
export function platformOfPath(pathname: string): PlatformId | null {
  if (pathname === '/') return 'playstation';
  for (const p of PLATFORMS) {
    if (p.prefixes.some((x) => pathname === x || pathname.startsWith(x + '/'))) {
      return p.id;
    }
  }
  return null;
}

/** Последняя выбранная витрина — для общих страниц. */
const PLATFORM_KEY = 'gamestore-platform';

export function loadLastPlatform(): PlatformId {
  try {
    const v = localStorage.getItem(PLATFORM_KEY);
    return PLATFORMS.some((p) => p.id === v) ? (v as PlatformId) : DEFAULT_PLATFORM;
  } catch {
    return DEFAULT_PLATFORM;
  }
}

export function saveLastPlatform(id: PlatformId): void {
  try {
    localStorage.setItem(PLATFORM_KEY, id);
  } catch {
    // Приватный режим или запрет хранилища — просто не запоминаем.
  }
}
