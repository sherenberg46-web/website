/**
 * Заголовки и описания карточек товара для поисковой выдачи.
 *
 * Было: title = просто название игры, то есть «PRAGMATA | GAME STORE». По
 * такому заголовку нас находят те, кто и так знает название, — а человек,
 * который собирается покупать, ищет иначе: «купить пragmata ps5 беларусь»,
 * «сколько стоит», «цена в BYN». Коммерческие слова в заголовке — это не
 * украшение, а совпадение с тем, что человек набирает.
 *
 * Длина. Google обрезает заголовок примерно на шестидесяти знаках, а к
 * нашему ещё добавляется « | GAME STORE» из макета — тринадцать знаков.
 * Поэтому собираем от самого полного варианта к самому короткому и берём
 * первый, который влезает: у «Grand Theft Auto VI» помещается всё, у
 * «Marvel's Spider-Man 2: Digital Deluxe Edition» — только название.
 */

/** Сколько знаков остаётся на сам заголовок с учётом « | GAME STORE». */
const TITLE_BUDGET = 47;

export function productSeoTitle(title: string, platform?: string | null): string {
  const plat = (platform || '').trim();
  const variants = plat
    ? [
        `Купить ${title} для ${plat} в Беларуси — цена в BYN`,
        `Купить ${title} для ${plat} в Беларуси`,
        `Купить ${title} для ${plat}`,
      ]
    : [
        `Купить ${title} в Беларуси — цена в BYN`,
        `Купить ${title} в Беларуси`,
      ];
  // Ни один вариант не влез — оставляем «Купить» и само название.
  //
  // Раньше в этом случае возвращалось голое название, и на половине каталога
  // (203 карточки из 400 проверенных) заголовок оставался прежним: у игр
  // вроде «Demon Slayer: Kimetsu no Yaiba — The Hinokami Chronicles» название
  // само по себе длиннее любого разумного заголовка. Но обрезка в выдаче — не
  // повод отказываться от слова, ради которого всё затевалось: Google
  // показывает первые шестьдесят знаков, и «Купить» должно попасть в них,
  // даже если хвост названия не попадёт.
  return variants.find((v) => v.length <= TITLE_BUDGET) ?? `Купить ${title}`;
}

interface DescOpts {
  title: string;
  platform?: string | null;
  price?: number | null;
  isPreorder?: boolean;
  description?: string | null;
}

/**
 * Описание для выдачи: сначала то, что человек хотел узнать (что это, для
 * чего, сколько стоит, когда получит), потом — начало описания игры, если
 * место осталось.
 *
 * Раньше здесь стояли первые 160 знаков описания из PS Store. У большинства
 * игр это середина завязки сюжета: «Вайс-Сити, США. Джейсон и Лусия всегда
 * знали...» — ни цены, ни того, что игру вообще можно купить.
 */
export function productSeoDescription({
  title,
  platform,
  price,
  isPreorder,
  description,
}: DescOpts): string {
  const plat = (platform || '').trim();
  const head = plat ? `${title} для ${plat}` : title;
  const priceText = price && price > 0 ? ` — ${price} BYN.` : '.';
  const delivery = isPreorder
    ? ' Предзаказ: доступ к дате выхода игры.'
    : ' Выдача обычно за 30 минут.';
  const base = `${head}${priceText}${delivery} Оплата в BYN, гарантия магазина.`;

  const clean = (description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return base.slice(0, 160);

  const room = 160 - base.length - 2;
  if (room < 40) return base.slice(0, 160);
  // Обрезаем по границе слова: «...что играют п» в выдаче читается как сбой.
  let tail = clean.slice(0, room);
  const lastSpace = tail.lastIndexOf(' ');
  if (lastSpace > room * 0.6) tail = tail.slice(0, lastSpace);
  return `${base} ${tail.trim()}…`;
}
