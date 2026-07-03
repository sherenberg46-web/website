'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  total: number;
  pageSize: number;
  offset: number;
  basePath?: string;
}

export function CatalogPagination({ total, pageSize, offset, basePath = '/games' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    const newOffset = (page - 1) * pageSize;
    if (newOffset === 0) params.delete('offset');
    else params.set('offset', String(newOffset));
    router.push(`${basePath}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== null) {
      pages.push(null); // ellipsis
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl border border-border bg-bg-card flex items-center justify-center text-text-secondary disabled:opacity-30 hover:border-accent/40 hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`e-${i}`} className="text-text-secondary px-1">…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={clsx(
              'w-9 h-9 rounded-xl border text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-accent/10 border-accent/50 text-accent'
                : 'border-border bg-bg-card text-text-secondary hover:text-text-primary hover:border-accent/30'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl border border-border bg-bg-card flex items-center justify-center text-text-secondary disabled:opacity-30 hover:border-accent/40 hover:text-text-primary transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
