/**
 * BuildCalc Pro — Responsive sub-tools grid with instant empty state.
 */
import { SearchX } from "lucide-react";
import type { ToolMetadata } from "@/types/estimator";
import { ToolCard } from "./ToolCard";
import { Button } from "@/components/ui/button";

export function ToolCardGrid({
  tools,
  onClearFilters,
  showCategory = false,
  querySuffix,
  emptyTitle = "No tools match your filters",
  emptyHint,
}: {
  tools: ToolMetadata[];
  onClearFilters?: () => void;
  showCategory?: boolean;
  querySuffix?: string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-700 px-6 py-14 text-center">
        <SearchX className="h-10 w-10 text-zinc-600" />
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-wide">
            {emptyTitle}
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            {emptyHint ?? "Try a different sub-trade or search term."}
          </p>
        </div>
        {onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="min-h-[44px]"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((t) => (
        <ToolCard key={t.id} tool={t} showCategory={showCategory} querySuffix={querySuffix} />
      ))}
    </div>
  );
}
