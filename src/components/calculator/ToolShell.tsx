/**
 * BuildCalc Pro — Universal tool shell (Phase 4A).
 *
 * Desktop: two-column grid, inputs left, sticky results right.
 * Mobile: inputs stacked, full results inline below, plus a sticky bottom
 * summary bar that scrolls to the results while the user tweaks inputs.
 */
"use client";

import * as React from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ToolSummary {
  value: string;
  unit: string;
  label: string;
}

export function ToolShell({
  inputs,
  results,
  summary,
}: {
  inputs: React.ReactNode;
  results: React.ReactNode;
  summary: ToolSummary;
}) {
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
        {/* Inputs */}
        <div className="min-w-0">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">{inputs}</div>
        </div>

        {/* Results — sticky rail on desktop, inline section on mobile */}
        <div ref={resultsRef} className="min-w-0 scroll-mt-24">
          <div className="lg:sticky lg:top-32">{results}</div>
        </div>
      </div>

      {/* Mobile sticky summary bar */}
      <div className="no-print sticky bottom-0 z-30 -mx-4 border-t border-border bg-zinc-950/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {summary.label}
            </p>
            <p className="truncate font-mono text-xl font-extrabold tabular-nums text-accent">
              {summary.value}{" "}
              <span className="text-xs font-bold text-accent/80">{summary.unit}</span>
            </p>
          </div>
          <Button
            variant="default"
            onClick={scrollToResults}
            className="min-h-[48px] shrink-0"
          >
            Full breakdown
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
