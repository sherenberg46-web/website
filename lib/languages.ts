/**
 * Языки игры на карточке.
 *
 * Это первый вопрос покупателя — «а русский там есть?» — и до сих пор карточка
 * на него молчала. Данные снимает локальный прогон со страницы PS Store и
 * отправляет на сервер; после сплошного осмотра каталога они есть у 15922
 * украинских карточек из 23683 и у 14110 турецких из 22574.
 *
 * Где нет — не пишем ничего. «Языки неизвестны» и «русского нет» для
 * покупателя это разные вещи, и путать их нельзя: во втором случае человек
 * откажется от покупки, в первом — спросит менеджера.
 */
/**
 * Названия языков прилагательными, а не существительными.
 *
 * «Озвучка: русский, английский» — так не говорят. Говорят «озвучка русская,
 * английская» и «субтитры русские, английские». Для покупателя это не
 * придирка к стилю: строка читается с одного взгляда только когда написана
 * по-человечески.
 *
 * Хранится женский род (он же для озвучки), множественное число получается
 * заменой «ая» на «ие» — во всех языках этого списка правило одно.
 */
const ADJECTIVES: Record<string, string> = {
  ru: 'русская',
  en: 'английская',
  uk: 'украинская',
  pl: 'польская',
  de: 'немецкая',
  fr: 'французская',
  es: 'испанская',
  it: 'итальянская',
  pt: 'португальская',
  tr: 'турецкая',
  ja: 'японская',
  zh: 'китайская',
  ko: 'корейская',
  ar: 'арабская',
  cs: 'чешская',
  hu: 'венгерская',
  nl: 'нидерландская',
  sv: 'шведская',
  da: 'датская',
  fi: 'финская',
  no: 'норвежская',
  el: 'греческая',
  th: 'тайская',
  hr: 'хорватская',
};

/** Коды вида 'es_MX' приводим к языку: витрине важен язык, а не диалект. */
function normalize(codes: string[] | undefined | null): string[] {
  const out: string[] = [];
  for (const raw of codes ?? []) {
    const c = String(raw).trim().toLowerCase().slice(0, 2);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

export interface LanguageInfo {
  /** Есть ли о чём говорить вообще. */
  known: boolean;
  hasRussianAudio: boolean;
  hasRussianSubs: boolean;
  audio: string[];
  subs: string[];
  /** Короткая строка для верхней части карточки. */
  headline: string | null;
}

export function languageInfo(
  langAudio?: string[] | null,
  langSubs?: string[] | null
): LanguageInfo {
  const audio = normalize(langAudio);
  const subs = normalize(langSubs);
  const known = audio.length > 0 || subs.length > 0;
  const hasRussianAudio = audio.includes('ru');
  const hasRussianSubs = subs.includes('ru');

  let headline: string | null = null;
  if (known) {
    if (hasRussianAudio) headline = 'Русская озвучка';
    else if (hasRussianSubs) headline = 'Русские субтитры';
    else headline = 'Русского языка нет';
  }

  return { known, hasRussianAudio, hasRussianSubs, audio, subs, headline };
}

/**
 * Список языков строкой.
 *
 * form = 'audio' → «русская, английская» (согласуется с «озвучка»)
 * form = 'subs'  → «русские, английские» (согласуется с «субтитры»)
 */
export function languageNames(codes: string[], form: 'audio' | 'subs' = 'audio'): string {
  return codes
    .map((c) => {
      const adj = ADJECTIVES[c];
      if (!adj) return c;
      return form === 'subs' ? adj.replace(/ая$/, 'ие') : adj;
    })
    .join(', ');
}
