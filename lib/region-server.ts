import { cookies } from 'next/headers';
import { parseRegion, REGION_COOKIE, type Region } from './region';

/** Регион из cookie — для server components. Делает страницу динамической. */
export function getRegion(): Region {
  return parseRegion(cookies().get(REGION_COOKIE)?.value);
}
