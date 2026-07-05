import { ProductCardSkeleton } from '@/components/ui/Loading';

/** Скелетон при переходах между страницами — вместо «замирания». */
export default function RouteLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse mb-8 space-y-3">
        <div className="h-4 w-32 bg-bg-card rounded" />
        <div className="h-9 w-64 bg-bg-card rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
