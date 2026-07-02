// Регионы каталога — как в Telegram Mini App (UA по умолчанию, TR — только подписки/пополнение)
export type Region = 'UA' | 'TR';

export const REGION_COOKIE = 'region';

export const REGIONS: { value: Region; flag: string; label: string }[] = [
  { value: 'UA', flag: '🇺🇦', label: 'UA · Украина' },
  { value: 'TR', flag: '🇹🇷', label: 'TR · Турция' },
];

export function parseRegion(v: string | undefined | null): Region {
  return v === 'TR' ? 'TR' : 'UA';
}

export function getClientRegion(): Region {
  if (typeof document === 'undefined') return 'UA';
  const m = document.cookie.match(/(?:^|;\s*)region=(UA|TR)/);
  return parseRegion(m?.[1]);
}

export function setClientRegion(r: Region): void {
  document.cookie = `${REGION_COOKIE}=${r}; path=/; max-age=31536000; samesite=lax`;
}
