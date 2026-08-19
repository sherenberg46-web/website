'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Описание игры с возможностью раскрыть.
 *
 * Раньше текст обрезался классом line-clamp-5 наглухо: у больших карточек
 * пять строк — это первый абзац сюжета, а всё остальное (что входит в
 * издание, бонусы предзаказа, условия правообладателя) покупатель прочитать
 * не мог вовсе. Обрезка при этом честнее полного текста: у PS Store описания
 * заканчиваются юридическим хвостом про автозагрузку, подписки и сроки акций,
 * и вываливать его на витрину незачем. Поэтому не «показать всё сразу», а
 * «читать дальше» — шум остаётся за кликом, а нужное доступно.
 */
export function GameDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  // Короткое описание разворачивать не из чего: кнопка под тремя строками
  // выглядит как обещание, за которым ничего нет.
  const long = text.length > 420;

  return (
    <div>
      <p
        className={`text-text-secondary leading-relaxed text-sm whitespace-pre-line ${
          open || !long ? '' : 'line-clamp-5'
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-accent text-sm font-medium hover:underline"
        >
          {open ? 'Свернуть' : 'Читать дальше'}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
