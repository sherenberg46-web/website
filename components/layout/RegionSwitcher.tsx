'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import {
  REGIONS,
  getClientRegion,
  setClientRegion,
  type Region,
} from '@/lib/region';
import { RegionBadge } from '@/components/ui/RegionBadge';

/** Переключатель региона каталога (UA/TR) — как в Telegram Mini App. */
export function RegionSwitcher() {
  const router = useRouter();
  const [region, setRegion] = useState<Region>('UA');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRegion(getClientRegion());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = REGIONS.find((r) => r.value === region) ?? REGIONS[0];

  function select(r: Region) {
    setRegion(r);
    setClientRegion(r);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-11 px-2 rounded-control text-sm text-text-primary hover:bg-white/5 transition-colors"
        title="Регион каталога"
      >
        <RegionBadge code={current.value} />
        <span className="flex flex-col items-start leading-none">
          <span className="hidden sm:block text-[10px] uppercase tracking-wider text-text-secondary">
            Регион
          </span>
          <span className="text-xs font-semibold text-text-primary sm:mt-0.5">
            {current.value === 'UA' ? 'Украина' : 'Турция'}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            'hidden sm:block w-3.5 h-3.5 text-text-secondary shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-3 border border-border rounded-card shadow-elevation-2 overflow-hidden z-50">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => select(r.value)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 min-h-[44px] text-sm text-left transition-colors',
                r.value === region
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <RegionBadge code={r.value} />
              <span>{r.value === 'UA' ? 'Украина' : 'Турция'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
