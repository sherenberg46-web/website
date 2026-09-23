/**
 * Разделы каталога PlayStation.
 *
 * Навигация теперь своя у каждой витрины и живёт в lib/platforms.ts —
 * шапка и мобильное меню берут её оттуда. Этот экспорт оставлен для
 * совместимости.
 */
import { getPlatform } from '@/lib/platforms';

export const NAV_LINKS = getPlatform('playstation').nav;
