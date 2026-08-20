import type { Metadata } from 'next';
import Link from 'next/link';

// Раньше страница не объявляла свои метаданные и наследовала robots из
// корневого layout (index: true) — хотя показывает ровно то же самое всем,
// у кого notFound() сработал по любому адресу. Хуже того: у этого сайта
// такие страницы часто отдаются с HTTP 200 вместо 404 (Next.js не может
// поменять статус ответа, если он уже начал стримиться через глобальный
// app/loading.tsx — см. объяснение в отчёте). Раз статус остаётся 200,
// единственный сигнал, которым можно явно сказать Google «здесь нечего
// индексировать», — это meta robots на самой странице.
export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gradient mb-4">404</p>
      <h1 className="text-3xl font-semibold text-text-primary mb-3">Страница не найдена</h1>
      <p className="text-text-secondary mb-8 max-w-md">
        Возможно, страница была удалена или вы ввели неверный адрес.
      </p>
      <Link
        href="/"
        className="bg-accent hover:bg-accent-hover text-accent-contrast font-semibold px-8 py-3 rounded-md transition-all"
      >
        На главную
      </Link>
    </div>
  );
}
