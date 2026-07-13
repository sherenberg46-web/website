'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border mx-auto mb-6 flex items-center justify-center">
        <RefreshCw className="w-7 h-7 text-accent" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Что-то пошло не так</h1>
      <p className="text-text-secondary mb-8">
        Не удалось загрузить страницу. Это временная проблема — попробуйте ещё раз.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-md transition-colors text-sm"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="px-8 py-3.5 rounded-full border border-border text-text-primary text-sm font-semibold hover:border-accent/40 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
