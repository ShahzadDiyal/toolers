/**
 * BuildCalc Pro Skeleton loader for category hubs.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>
      <div className="mt-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-11 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
