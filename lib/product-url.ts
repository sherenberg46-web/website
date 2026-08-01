/**
 * Единая точка сборки адреса карточки игры.
 *
 * Раньше адрес был плоским: `/games/{id}`. Теперь платформа вынесена в путь —
 * `/games/{platform}/{id}`. Это открывает посадочные страницы под платформу
 * (`/games/ps`, в будущем `/games/xbox`, `/games/steam`) и задаёт структуру
 * до расширения каталога, пока индексация только началась.
 *
 * Почему id, а не человекочитаемый slug из названия: id — то, чем товар
 * резолвится на бэкенде и в общей базе с ботом. Оставляя id ключом, мы меняем
 * только адреса сайта и не трогаем ни базу, ни бота. Декоративный slug
 * (`.../mortal-kombat-11-45678`) можно добавить отдельным шагом — для него
 * нужно, чтобы облегчённый эндпоинт карты сайта отдавал ещё и название.
 *
 * ВАЖНО: все ссылки на карточку и все canonical идут ТОЛЬКО через этот модуль.
 * Одна форма адреса в одном месте — иначе sitemap, canonical и внутренние
 * ссылки разъезжаются, и поисковик получает противоречивые указания.
 */

/**
 * Сегмент платформы в адресе.
 *
 * Сейчас весь каталог — PlayStation (в базе platform = 'PS4' | 'PS5' |
 * 'PS4, PS5' | null), поэтому сегмент всегда `ps`. Функция принимает исходную
 * строку платформы на вырост: когда появятся Xbox и Steam, здесь добавится
 * разбор, а формат адресов менять уже не придётся.
 */
export function platformSlug(platform?: string | null): string {
  const p = (platform ?? '').toLowerCase();
  if (p.includes('xbox')) return 'xbox';
  if (p.includes('steam') || p.includes('pc')) return 'steam';
  // PS4 / PS5 / 'PS4, PS5' / пусто — всё PlayStation.
  return 'ps';
}

/** Известные платформенные сегменты — для валидации листингов. */
export const PLATFORM_SEGMENTS = ['ps', 'xbox', 'steam'] as const;
export type PlatformSegment = (typeof PLATFORM_SEGMENTS)[number];

export function isPlatformSegment(value: string): value is PlatformSegment {
  return (PLATFORM_SEGMENTS as readonly string[]).includes(value);
}

/**
 * Путь карточки игры: `/games/{platform}/{id}`.
 *
 * Возвращает только путь (без домена) — годится и для <Link>, и как основа
 * для абсолютного canonical.
 */
export function gamePath(id: number | string, platform?: string | null): string {
  return `/games/${platformSlug(platform)}/${id}`;
}

/**
 * Разобрать последний сегмент адреса в числовой id товара.
 *
 * Принимает как чистое число (`45678`), так и форму с декоративным slug на
 * будущее (`mortal-kombat-11-45678`) — берём хвостовую группу цифр.
 * Возвращает null, если id извлечь нельзя.
 */
export function parseGameId(segment: string): number | null {
  const m = segment.match(/(\d+)$/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}
