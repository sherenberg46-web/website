import Link from 'next/link';
import type { Metadata } from 'next';
import { guides } from './guides-data';

/**
 * Раздел «Гайды» — список статей.
 *
 * Задача раздела — SEO-трафик с покупательским намерением: статьи отвечают
 * на вопросы, которые человек гуглит перед покупкой («как купить игру на ps5
 * в беларуси», «как оплатить ps store через ерип»), и ведут его в каталог.
 * Заодно это уникальный контент и внутренняя перелинковка — то, чего
 * поисковику не хватало для индексации карточек каталога.
 */

export const metadata: Metadata = {
  title: 'Гайды для игроков PlayStation в Беларуси | GAME STORE',
  description:
    'Как купить игру на PS4/PS5 в Беларуси, оплатить через ЕРИП, разобраться с регионом аккаунта UA. Пошаговые инструкции от gamesstore.by.',
  alternates: { canonical: '/guides' },
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-text-primary">Гайды</h1>
      <p className="mt-3 text-text-secondary">
        Как купить игру, оплатить через ЕРИП и разобраться с регионом аккаунта — коротко и по шагам.
      </p>
      <div className="mt-8 flex flex-col gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group rounded-2xl border border-border bg-bg-card p-5 transition-colors hover:border-border-strong hover:bg-bg-card-hover"
          >
            <h2 className="font-bold text-text-primary group-hover:text-accent">{g.h1}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{g.excerpt}…</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
