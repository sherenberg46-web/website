'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { PLATFORMS, saveLastPlatform } from '@/lib/platforms';
import { usePlatform } from './usePlatform';

/** Фирменный цвет активной витрины — чтобы было видно, где ты сейчас. */
const ACTIVE_CLASS: Record<string, string> = {
  playstation: 'bg-[#0070D1] text-white',
  xbox: 'bg-[#107C10] text-white',
  steam: 'bg-[#1B75BB] text-white',
};

/**
 * Переключатель витрин: PlayStation — весь каталог, Xbox — свой раздел.
 * Ссылки, а не кнопки: у каждой витрины свой адрес, и его можно открыть
 * в новой вкладке или прислать другу.
 */
export function PlatformSwitcher({ className }: { className?: string }) {
  const current = usePlatform();

  return (
    <nav
      aria-label="Платформа"
      className={clsx(
        'flex gap-1 rounded-full border border-border bg-surface-1 p-1',
        className
      )}
    >
      {PLATFORMS.map((p) => {
        const active = p.id === current;
        return (
          <Link
            key={p.id}
            href={p.home}
            onClick={() => saveLastPlatform(p.id)}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex-1 rounded-full px-3.5 py-1.5 text-center text-[13px] font-bold whitespace-nowrap transition-colors',
              active
                ? ACTIVE_CLASS[p.id]
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
