import clsx from 'clsx';
import type { Region } from '@/lib/region';

/** Цветной бейдж региона — вместо emoji-флагов (Windows их не отображает). */
export function RegionBadge({ code, size = 'sm' }: { code: Region; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-extrabold tracking-tight select-none shrink-0',
        size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[11px]',
        code === 'UA'
          ? 'bg-gradient-to-b from-sky-500 via-sky-400 to-yellow-400 text-black'
          : 'bg-gradient-to-b from-red-500 to-red-700 text-white'
      )}
    >
      {code}
    </span>
  );
}
