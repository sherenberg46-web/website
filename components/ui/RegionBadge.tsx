import clsx from 'clsx';

/** Регионы бейджа шире, чем регионы каталога: топапы бывают и PL/IN */
export type BadgeRegion = 'UA' | 'TR' | 'PL' | 'IN';

const STYLES: Record<BadgeRegion, string> = {
  UA: 'bg-gradient-to-b from-sky-500 via-sky-400 to-yellow-400 text-black',
  TR: 'bg-gradient-to-b from-red-500 to-red-700 text-white',
  PL: 'bg-gradient-to-b from-gray-100 via-gray-100 to-red-600 text-black',
  IN: 'bg-gradient-to-b from-orange-500 via-gray-100 to-green-600 text-black',
};

/** Цветной бейдж региона — вместо emoji-флагов (Windows их не отображает). */
export function RegionBadge({ code, size = 'sm' }: { code: BadgeRegion; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-extrabold tracking-tight select-none shrink-0',
        size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[11px]',
        STYLES[code]
      )}
    >
      {code}
    </span>
  );
}
