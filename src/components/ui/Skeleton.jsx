export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="break-inside-avoid mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <Skeleton className="w-2 h-8" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
