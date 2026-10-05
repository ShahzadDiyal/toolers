/**
 * BuildCalc Pro — Sub-trade filter pills.
 *
 * Horizontal scrollable segmented control with high-visibility amber active
 * state. Pure presentational — the parent owns state + URL synchronization.
 */
"use client";

import { cn } from "@/lib/utils";

export function TradeFilterTabs({
  subtrades,
  active,
  onChange,
  counts,
}: {
  /** Sub-trade names; "All" is prepended automatically. */
  subtrades: string[];
  active: string;
  onChange: (subtrade: string) => void;
  /** Optional per-tab counts. */
  counts?: Record<string, number>;
}) {
  const tabs = ["All", ...subtrades];
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Filter by sub-trade"
    >
      {tabs.map((t) => {
        const isActive = active === t;
        const count = counts?.[t];
        return (
          <button
            key={t}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t)}
            className={cn(
              "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgb(245_158_11/0.35)]"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-primary hover:text-primary",
            )}
          >
            {t}
            {count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[11px]",
                  isActive
                    ? "bg-black/25 text-primary-foreground"
                    : "bg-zinc-800 text-zinc-500",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
