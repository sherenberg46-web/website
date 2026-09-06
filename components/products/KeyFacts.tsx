import { ChevronDown } from 'lucide-react';
import { languageNames, type LanguageInfo } from '@/lib/languages';
import type { Region } from '@/lib/region';

interface Props {
  platform: string | null;
  genre?: string | null;
  releaseDate?: string | null;
  region: Region;
  productType: string | null;
  langs: LanguageInfo;
  hasEditions: boolean;
}

type Row = { label: string; value: React.ReactNode; stack?: boolean };

const TYPE_LABEL: Record<string, string> = {
  game: 'Цифровая игра',
  dlc: 'Дополнение (DLC)',
  subscription: 'Подписка',
  topup: 'Пополнение кошелька',
  key: 'Цифровой ключ',
};

/**
 * Ключевые характеристики товара.
 *
 * Серверный компонент, без JS: на мобильном — нативный <details> (доступен
 * с клавиатуры из коробки), на десктопе — всегда раскрытый список. Данные
 * только те, что уже есть у товара; API не меняется. Заменяет прежний
 * отдельный блок «полный список языков» — он был крупной карточкой над
 * ценой, здесь он свёрнут.
 */
export function KeyFacts({
  platform,
  genre,
  releaseDate,
  region,
  productType,
  langs,
  hasEditions,
}: Props) {
  const rows: Row[] = [];

  const platforms = platform
    ? platform.split(',').map((p) => p.trim()).filter(Boolean).join(' · ')
    : null;
  if (platforms) rows.push({ label: 'Платформа', value: platforms });

  const genres = genre
    ? genre.split(',').map((g) => g.trim()).filter(Boolean).slice(0, 3).join(', ')
    : null;
  if (genres) rows.push({ label: 'Жанр', value: genres });

  if (releaseDate) {
    const d = new Date(releaseDate);
    if (!Number.isNaN(d.getTime())) {
      rows.push({
        label: 'Дата выхода',
        value: d.toLocaleDateString('ru-BY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
    }
  }

  rows.push({
    label: 'Регион каталога',
    value: region === 'TR' ? 'Турция (TR)' : 'Украина (UA)',
  });

  if (hasEditions) {
    rows.push({ label: 'Издание', value: 'Несколько на выбор — см. выше' });
  }

  // Языки — длинные списки, поэтому строкой на всю ширину, а не в две колонки.
  if (langs.known) {
    if (langs.audio.length > 0) {
      rows.push({
        label: 'Озвучка',
        value: languageNames(langs.audio, 'audio'),
        stack: true,
      });
    }
    if (langs.subs.length > 0) {
      rows.push({
        label: 'Субтитры',
        value: languageNames(langs.subs, 'subs'),
        stack: true,
      });
    }
  }

  if (productType && TYPE_LABEL[productType]) {
    rows.push({ label: 'Тип', value: TYPE_LABEL[productType] });
  }

  const list = (
    <dl className="divide-y divide-border">
      {rows.map((r) =>
        r.stack ? (
          <div key={r.label} className="py-2.5">
            <dt className="text-sm text-text-secondary">{r.label}</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-text-primary">{r.value}</dd>
          </div>
        ) : (
          <div key={r.label} className="flex items-start justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-sm text-text-secondary">{r.label}</dt>
            <dd className="text-right text-sm text-text-primary">{r.value}</dd>
          </div>
        )
      )}
    </dl>
  );

  return (
    <div className="rounded-card border border-border bg-surface-1">
      {/* Мобильный: сворачиваемый */}
      <details className="group md:hidden">
        <summary className="tap-target flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-text-primary">Характеристики</span>
          <ChevronDown className="h-4 w-4 text-text-secondary transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-4 pb-3">{list}</div>
      </details>

      {/* Десктоп: всегда раскрыт */}
      <div className="hidden p-4 md:block">
        <p className="mb-1 text-sm font-semibold text-text-primary">Характеристики</p>
        {list}
      </div>

      {langs.known && (
        <p className="border-t border-border px-4 py-2.5 text-2xs leading-relaxed text-text-muted">
          Язык выбирается в настройках игры и не зависит от региона аккаунта.
        </p>
      )}
    </div>
  );
}
