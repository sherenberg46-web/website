/**
 * Проверка контакта в форме заказа.
 *
 * Поле одно на два вида связи — телефон или ник в Telegram, — и раньше в него
 * принималось что угодно. Менеджер получал заказ и не мог по нему написать:
 * «89» вместо номера, «вася» без собаки, «нет» вместо контакта. Заказ при этом
 * считался оформленным, и покупатель ждал ответа, которого не будет.
 *
 * Разбираем по первому символу: «+» или цифра — значит телефон, «@» или буква —
 * ник. Так подсказка получается точной («не хватает цифр» вместо общего
 * «неверный формат»), а не сводится к «введите правильно».
 */

export type ContactKind = 'phone' | 'telegram';

export interface ContactCheck {
  ok: boolean;
  kind: ContactKind | null;
  /** Приведённое к единому виду значение: +375291234567 или @username. */
  normalized: string;
  error: string | null;
}

/**
 * Телефон: от 9 до 15 цифр по международному стандарту E.164.
 *
 * Не привязываемся к белорусским кодам: покупают и из других стран, а
 * менеджер всё равно перезванивает через Telegram или WhatsApp. Проверяем
 * только то, что это правдоподобный номер, а не набор цифр.
 */
const PHONE_MIN = 9;
const PHONE_MAX = 15;

/**
 * Ник Telegram: от 5 до 32 знаков, латиница, цифры и подчёркивание.
 * Ограничения самого Telegram — ник вне их просто не существует.
 */
const TG_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

export function checkContact(raw: string): ContactCheck {
  const value = (raw ?? '').trim();
  const empty: ContactCheck = { ok: false, kind: null, normalized: '', error: null };

  if (!value) return { ...empty, error: 'Укажите телефон или ник в Telegram' };

  // Ссылку на профиль тоже принимаем: её удобнее скопировать, чем набрать ник.
  const fromLink = value.match(/^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/@?([\w]+)\/?$/i);
  // Про телефон говорим только тогда, когда в поле есть цифры. Иначе «вася»
  // получал подсказку «в номере не хватает цифр» — человек не понимал, что от
  // него хотят, и правил не то.
  const hasDigits = /\d/.test(value);
  const looksLikeTelegram = !!fromLink || value.startsWith('@') || !hasDigits;

  if (looksLikeTelegram) {
    const nick = (fromLink ? fromLink[1] : value.replace(/^@/, '')).trim();
    if (!TG_RE.test(nick)) {
      const cyrillic = /[^\x00-\x7F]/.test(nick);
      return {
        ...empty,
        kind: 'telegram',
        error: cyrillic
          ? 'Ник в Telegram пишется латиницей — посмотрите его в профиле, он начинается с @'
          : nick.length < 5
            ? 'Ник в Telegram — не короче 5 знаков. Или укажите телефон с кодом страны'
            : 'Ник в Telegram: латиница, цифры и подчёркивание, без пробелов',
      };
    }
    return { ok: true, kind: 'telegram', normalized: `@${nick}`, error: null };
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length < PHONE_MIN || digits.length > PHONE_MAX) {
    return {
      ok: false,
      kind: 'phone',
      normalized: '',
      error:
        digits.length < PHONE_MIN
          ? 'В номере не хватает цифр — укажите с кодом страны, например +375291234567'
          : 'В номере слишком много цифр',
    };
  }

  // Белорусский номер без кода страны — частый случай: 80291234567 или
  // 291234567. Дописываем код сами, чтобы менеджеру не пришлось гадать.
  let normalized = digits;
  if (normalized.startsWith('80') && normalized.length === 11) {
    normalized = `375${normalized.slice(2)}`;
  } else if (normalized.length === 9) {
    normalized = `375${normalized}`;
  }
  return { ok: true, kind: 'phone', normalized: `+${normalized}`, error: null };
}
