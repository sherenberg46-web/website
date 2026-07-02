import Link from 'next/link';

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
        className="btn-gradient text-black font-semibold px-8 py-3 rounded-full transition-all"
      >
        На главную
      </Link>
    </div>
  );
}
