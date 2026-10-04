/**
 * BuildCalc Pro — Recently used / quick-access rail.
 * Reads the MRU slug list from localStorage; hidden when empty.
 */
"use client";

import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { useRecentTools } from "@/lib/recent-tools";
import { getCategory, toolHref } from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";
import { Badge } from "@/components/ui/badge";

export function RecentlyUsed() {
  const recent = useRecentTools().slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <section
      className="border-b border-border bg-zinc-950/60"
      aria-label="Recently used calculators"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Quick access — pick up where you left off
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((t) => {
            const Icon = toolIcon(t.iconName);
            return (
              <Link
                key={t.id}
                href={toolHref(t)}
                className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-zinc-900">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold group-hover:text-primary">
                    {t.title}
                  </span>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {getCategory(t.category).label.split(",")[0]}
                  </Badge>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
