'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  DEFAULT_PLATFORM,
  loadLastPlatform,
  platformOfPath,
  saveLastPlatform,
  type PlatformId,
} from '@/lib/platforms';

/**
 * Текущая витрина: по пути, а на общих страницах (корзина, контакты) —
 * та, из которой покупатель пришёл.
 */
export function usePlatform(): PlatformId {
  const pathname = usePathname();
  const own = platformOfPath(pathname);
  const [last, setLast] = useState<PlatformId>(DEFAULT_PLATFORM);

  useEffect(() => {
    if (own) {
      saveLastPlatform(own);
      setLast(own);
    } else {
      setLast(loadLastPlatform());
    }
  }, [own]);

  return own ?? last;
}
