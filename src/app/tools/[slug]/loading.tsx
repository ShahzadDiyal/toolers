/**
 * BuildCalc Pro — Skeleton loader for tool pages (instant transitions).
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid gap-0 overflow-hidden rounded-xl border border-border lg:grid-cols-[1fr_400px]">
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-none border-t border-border lg:border-l lg:border-t-0" />
          </div>
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
