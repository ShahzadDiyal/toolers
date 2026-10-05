/**
 * BuildCalc Pro — Full calculator directory (/tools).
 * Category sections rendering the shared ToolCard (pin, in/out summary,
 * launch action). Search filters across the registry.
 */
"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ToolCard } from "@/components/category/ToolCard";
import {
  TOOLS,
  TOOL_CATEGORIES,
  getCategory,
  searchTools,
  TOTAL_TOOLS,
} from "@/data/toolsRegistry";

export default function ToolsPage() {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => searchTools(query), [query]);
  const filtering = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "All calculators" }]} />

      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide sm:text-5xl">
          Calculator <span className="text-primary">directory</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          {TOTAL_TOOLS} trade calculators and counting. Pin favorites for
          one-tap access on the job site.
        </p>
        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search calculators — “roof”, “paint”, “fraction”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-11 text-base"
            aria-label="Search calculators"
          />
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {TOOL_CATEGORIES.map((c) => {
          const meta = getCategory(c);
          const tools = (filtering ? results : TOOLS).filter((t) => t.category === c);
          if (tools.length === 0) return null;
          const live = tools.filter((t) => t.available).length;
          return (
            <section key={c} aria-label={meta.label}>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
                    {meta.label}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">{meta.tagline}</p>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono">
                  {live}/{tools.length} live
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </section>
          );
        })}

        {filtering && results.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-zinc-400">
              No calculators match{" "}
              <span className="font-semibold text-zinc-200">“{query.trim()}”</span>.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Try “concrete”, “roof”, “paint” — or press{" "}
              <kbd className="rounded border border-border bg-zinc-900 px-1.5 py-0.5 font-mono text-xs">
                ⌘K
              </kbd>{" "}
              for the smart search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
