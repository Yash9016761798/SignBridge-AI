export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
        <div className="h-4 w-72 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-card border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-900"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-[14px] bg-surface-200 dark:bg-surface-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
