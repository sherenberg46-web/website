export function Loading({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className ?? ''}`}>
      <div className="w-10 h-10 rounded-full border-2 border-border border-t-accent animate-spin" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-bg-card-hover" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-bg-card-hover rounded w-3/4" />
        <div className="h-3 bg-bg-card-hover rounded w-1/2" />
        <div className="h-5 bg-bg-card-hover rounded w-2/3" />
      </div>
    </div>
  );
}
