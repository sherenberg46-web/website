import clsx from 'clsx';

/** Регионы бейджа шире, чем регионы каталога: топапы бывают и PL/IN */
export type BadgeRegion = 'UA' | 'TR' | 'PL' | 'IN';

// Реальные цвета флагов, горизонтальные полосы
const STYLES: Record<BadgeRegion, string> = {
  UA: 'bg-[linear-gradient(to_bottom,#0057B7_50%,#FFD700_50%)] text-white',
  TR: 'bg-[#E30A17] text-white',
  PL: 'bg-[linear-gradient(to_bottom,#FFFFFF_50%,#DC143C_50%)] text-slate-900',
  IN: 'bg-[linear-gradient(to_bottom,#FF9933_33.4%,#F8F8F8_33.4%,#F8F8F8_66.7%,#138808_66.7%)] text-slate-900',
};

/** Прямоугольный флаг-бейдж региона — вместо emoji-флагов (Windows их не отображает). */
export function RegionBadge({ code, size = 'sm' }: { code: BadgeRegion; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-[4px] font-extrabold tracking-tight select-none shrink-0',
        'ring-1 ring-inset ring-black/25 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]',
        code === 'PL' || code === 'IN' ? '[text-shadow:none]' : '',
        size === 'sm' ? 'w-7 h-5 text-[9px]' : 'w-9 h-[26px] text-[11px]',
        STYLES[code]
      )}
    >
      {code}
    </span>
  );
}
