/**
 * Источник визита на сайт (UTM-метки, переход из рекламы/Instagram/поиска).
 *
 * Храним в localStorage два касания:
 *   first — первый размеченный визит, больше не меняется;
 *   last  — последний размеченный визит.
 * Визит без метки (прямой заход, обычная навигация) ничего не перезаписывает —
 * так же работает бот: /start без параметра источник не меняет.
 *
 * Куда уходит:
 *   — в заказ с сайта (поле attribution) → orders.ref_source / orders.utm;
 *   — в ссылку на бота: ?start=site_<метка> → источник клиента в Telegram.
 *
 * Метки — тот же словарь, что в Telegram: ig_bio, ig_story_ДДММ, ig_ads, tgch…
 * Пример ссылки: https://gamesstore.by/?utm_source=ig_bio
 */

const KEY = 'gamestore-attribution';

export interface Touch {
  /** Метка источника для отчёта (ig_bio, search, fb_ads…) */
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Пришёл ли переход с fbclid (сам идентификатор не храним) */
  fbclid?: boolean;
  referrer?: string;
  landing?: string;
  at?: string;
}

export interface Attribution {
  first?: Touch;
  last?: Touch;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

const THREADS_HOSTS = ['threads.net', 'threads.com'];

const SEARCH_HOSTS = [
  'google.', 'yandex.', 'ya.ru', 'bing.com', 'duckduckgo.com', 'search.yahoo.', 'go.mail.ru',
];

/** Привести значение к формату метки: a-z 0-9 _ -, до 64 символов */
export function toTag(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const tag = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
  return tag || undefined;
}

/**
 * Метка визита. Порядок: utm_source → Threads → fbclid → referrer.
 * Threads → threads, Instagram → ig_referral, поисковики → search,
 * переход с fbclid → fb_ads.
 * Threads проверяется раньше fbclid: приложения Meta могут дописывать fbclid
 * к ссылкам, и без этого переход из Threads попал бы в «Рекламу Meta».
 * Остальное — без метки («Неизвестно» в отчёте).
 */
export function deriveRef(t: Touch): string | undefined {
  const utm = toTag(t.utm_source);
  if (utm) return utm;
  let host = '';
  if (t.referrer) {
    try {
      host = new URL(t.referrer).hostname.toLowerCase();
    } catch {
      host = '';
    }
  }
  if (THREADS_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'threads';
  if (t.fbclid) return 'fb_ads';
  if (host) {
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'ig_referral';
    if (SEARCH_HOSTS.some((s) => host === s || host.includes(s))) return 'search';
  }
  return undefined;
}

function read(): Attribution {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === 'object' ? (v as Attribution) : {};
  } catch {
    return {};
  }
}

function write(a: Attribution): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* приватный режим — источник просто не сохранится */
  }
}

/** Разобрать текущий визит. Вызывается один раз при загрузке страницы. */
export function captureVisit(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) touch[k] = v.slice(0, 200);
  }
  if (params.get('fbclid')) touch.fbclid = true;

  // Referrer — только внешний: переходы внутри сайта источником не считаются
  const ref = document.referrer;
  if (ref) {
    try {
      if (new URL(ref).hostname !== window.location.hostname) touch.referrer = ref.slice(0, 300);
    } catch {
      /* битый referrer — игнорируем */
    }
  }

  touch.ref = deriveRef(touch);
  if (!touch.ref) return; // визит без метки ничего не меняет

  touch.landing = (window.location.pathname + window.location.search).slice(0, 300);
  touch.at = new Date().toISOString();

  const a = read();
  write({ first: a.first ?? touch, last: touch });
}

/** Сохранённые касания — для заказа с сайта. */
export function getAttribution(): Attribution | undefined {
  if (typeof window === 'undefined') return undefined;
  const a = read();
  return a.first || a.last ? a : undefined;
}

/** Параметр для ссылки на бота: site_<метка> или site (до 64 символов). */
export function botStartParam(): string {
  const last = typeof window === 'undefined' ? undefined : read().last?.ref;
  const tag = toTag(last);
  return tag ? `site_${tag}`.slice(0, 64) : 'site';
}
