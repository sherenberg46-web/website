/**
 * Разделы каталога — общий список для десктопной навигации в шапке
 * (Header) и мобильного меню (MobileTabBar → «Меню»).
 *
 * Один источник, чтобы пункты не разъезжались между двумя навигациями.
 */
export const NAV_LINKS = [
  { href: '/games', label: 'Каталог' },
  { href: '/sale', label: 'Распродажа' },
  { href: '/new', label: 'Новинки' },
  { href: '/preorders', label: 'Предзаказы' },
  { href: '/subscriptions', label: 'Подписки' },
  { href: '/ea-play', label: 'EA Play' },
  { href: '/topup', label: 'Пополнение' },
  { href: '/guides', label: 'Гайды' },
] as const;
