// Источник истины по ценам подписок — тот же, что в Telegram Mini App.
// При изменении цен обновлять здесь И в приложении.
import type { Region } from './region';

export type Tier = 'essential' | 'extra' | 'deluxe';
export type Months = 1 | 3 | 12;

export const SUB_PRICES: Record<
  Region,
  { psplus: Record<Months, Record<Tier, number>>; eaplay: Record<1 | 12, number> }
> = {
  UA: {
    psplus: {
      1: { essential: 40, extra: 50, deluxe: 60 },
      3: { essential: 80, extra: 120, deluxe: 130 },
      12: { essential: 160, extra: 260, deluxe: 280 },
    },
    eaplay: { 1: 40, 12: 120 },
  },
  TR: {
    psplus: {
      1: { essential: 55, extra: 80, deluxe: 80 },
      3: { essential: 140, extra: 185, deluxe: 190 },
      12: { essential: 290, extra: 450, deluxe: 530 },
    },
    eaplay: { 1: 35, 12: 150 },
  },
};

export const PS_IDS: Record<Region, Record<Tier, Record<Months, number>>> = {
  UA: {
    essential: { 1: 35269, 3: 35270, 12: 35275 },
    extra: { 1: 35273, 3: 35276, 12: 35277 },
    deluxe: { 1: 35274, 3: 35278, 12: 35279 },
  },
  TR: {
    essential: { 1: 35211, 3: 35212, 12: 35213 },
    extra: { 1: 35208, 3: 35209, 12: 35210 },
    deluxe: { 1: 35205, 3: 35206, 12: 35207 },
  },
};

export const EA_IDS: Record<Region, Record<1 | 12, number>> = {
  UA: { 1: 35280, 12: 35281 },
  TR: { 1: 35214, 12: 35215 },
};

export const TIER_INFO: { id: Tier; label: string; features: string[] }[] = [
  {
    id: 'essential',
    label: 'Essential',
    features: ['Онлайн-мультиплеер', 'Ежемесячные игры', 'Облачные сохранения', 'Эксклюзивные скидки'],
  },
  {
    id: 'extra',
    label: 'Extra',
    features: ['Всё из Essential', 'Каталог 400+ игр', 'Коллекция Ubisoft+ Classics'],
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    features: ['Всё из Extra', 'Классика PS1/PS2/PSP', 'Пробные версии новинок'],
  },
];

export function monthsLabel(m: Months | 1 | 12): string {
  return m === 1 ? '1 месяц' : m === 3 ? '3 месяца' : '12 месяцев';
}
