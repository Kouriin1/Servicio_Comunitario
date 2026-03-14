export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-2xl ${className}`} />
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-slate-800/80 rounded-3xl shadow-soft p-6 space-y-4 border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-slate-700/40">
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-8 rounded-xl" />
          <Skeleton className="w-16 h-8 rounded-xl" />
        </div>
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
    </div>
  );
}
