/**
 * BuildCalc Pro Sub-trade filter pills.
 *
 * Horizontal scrollable segmented control with smooth touch scrolling and
 * clear active/inactive state matching the design board.
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
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 scrollbar-none"
      role="tablist"
      aria-label="Filter by sub-trade"
      style={{ WebkitOverflowScrolling: "touch" }}
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
              "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all",
              isActive
                ? "border-[#14284A] bg-[#14284A] text-white shadow-sm"
                : "border-zinc-300 bg-white text-[#5A6C85] hover:border-[#14284A] hover:text-[#14284A]",
            )}
          >
            {t}
            {count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[11px]",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#F1F5F9] text-[#5A6C85]",
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
