import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * Визуальная навигация по основным разделам.
 * Чисто презентационный блок: ведёт на уже существующие страницы каталога,
 * подписок и пополнения — никакой новой логики.
 */
const TILES = [
  {
    href: '/games?platform=PS5',
    title: 'Игры для PS5',
    text: 'Покупайте лучшие игры для PlayStation 5',
    img: '/images/tiles/ps5.png',
    imgClass: 'h-[96%] right-1.5 -bottom-2',
  },
  {
    href: '/games?platform=PS4',
    title: 'Игры для PS4',
    text: 'Огромный выбор игр для PlayStation 4',
    img: '/images/tiles/ps4.png',
    imgClass: 'h-[64%] right-0.5 bottom-0.5',
  },
  {
    href: '/subscriptions',
    title: 'Подписки PS Plus',
    text: 'Essential, Extra, Deluxe по выгодным ценам',
    img: '/images/tiles/psplus.png',
    imgClass: 'h-[58%] right-3 bottom-4',
  },
  {
    href: '/topup',
    title: 'Пополнение PSN',
    text: 'Пополняйте кошелек своего аккаунта',
    img: '/images/tiles/psn.png',
    imgClass: 'h-[80%] right-2 bottom-0.5',
  },
];

export function CategoryTiles() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {TILES.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="group relative overflow-hidden rounded-2xl border border-border bg-bg-card hover:bg-bg-card-hover hover:border-border-strong transition-colors min-h-[150px] p-5 flex flex-col"
        >
          <span className="relative z-10 font-bold text-sm text-text-primary max-w-[58%]">
            {t.title}
          </span>
          <span className="relative z-10 mt-1.5 text-[11px] leading-snug text-text-muted max-w-[58%]">
            {t.text}
          </span>
          <span className="relative z-10 mt-auto inline-flex w-7 h-7 rounded-full bg-bg-elevated border border-border-strong items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-contrast group-hover:border-accent transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <Image
            src={t.img}
            alt=""
            width={420}
            height={420}
            className={`pointer-events-none absolute object-contain object-right-bottom max-w-[44%] drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)] ${t.imgClass}`}
          />
        </Link>
      ))}
    </section>
  );
}
