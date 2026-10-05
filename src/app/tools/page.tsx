/**
 * BuildCalc Pro — Full calculator directory (/tools).
 *
 * Search + category-chip filtering over the registry, rendering the shared
 * ToolCard (pin toggle, in/out summary, launch action).
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  TOOL_CATEGORIES,
  getCategory,
  searchTools,
  TOTAL_TOOLS,
} from "@/data/toolsRegistry";
import { ToolCard } from "@/components/category/ToolCard";
import { CrumbNav, PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export default function ToolsPage() {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const searching = query.trim().length > 0;

  const results = React.useMemo(() => {
    const found = searchTools(query);
    return activeCat === "all"
      ? found
      : found.filter((t) => t.category === activeCat);
  }, [query, activeCat]);

  const shown = results.filter((t) => t.available);

  return (
    <>
      <PageHero
        eyebrow="Tool directory"
        title={
          <>
            Calculator <span className="text-[#ED7D22]">directory</span>
          </>
        }
        lede={`${TOTAL_TOOLS} free trade calculators and counting. Search, filter by trade, and pin favorites for one-tap access on the job site.`}
      >
        <div className="mt-6">
          <CrumbNav
            items={[{ label: "Home", href: "/" }, { label: "All calculators" }]}
          />
        </div>
        <div className="relative mt-6 max-w-xl">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6C85]"
            aria-hidden
          />
          <Input
            placeholder="Search calculators — “roof”, “paint”, “fraction”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 bg-white pl-11 text-base"
            aria-label="Search calculators"
          />
        </div>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          {[{ id: "all", label: "All" }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label.split(",")[0] }))].map(
            (c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                aria-pressed={activeCat === c.id}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold transition-colors",
                  activeCat === c.id
                    ? "border-[#14284A] bg-[#14284A] text-white"
                    : "border-zinc-300 bg-white text-[#0B1B33] hover:border-[#14284A]",
                )}
              >
                {c.label}
              </button>
            ),
          )}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {searching || activeCat !== "all" ? (
          <Reveal as="section" aria-label="Search results">
            <p className="reveal mb-4 text-sm text-[#5A6C85]">
              <span className="font-mono font-bold text-[#ED7D22]">
                {shown.length}
              </span>{" "}
              result{shown.length === 1 ? "" : "s"}
              {activeCat !== "all" && (
                <>
                  {" "}
                  in <span className="font-bold text-[#0B1B33]">{getCategory(activeCat as (typeof TOOL_CATEGORIES)[number]).label}</span>
                </>
              )}
              {searching && (
                <>
                  {" "}
                  for <span className="font-bold text-[#0B1B33]">“{query.trim()}”</span>
                </>
              )}
            </p>
            {shown.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((t, i) => (
                  <div
                    key={t.id}
                    className="reveal"
                    style={{ "--reveal-delay": `${(i % 6) * 60}ms` } as React.CSSProperties}
                  >
                    <ToolCard tool={t} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="reveal py-16 text-center">
                <p className="text-[#5A6C85]">
                  No calculators match{" "}
                  <span className="font-semibold text-[#0B1B33]">
                    “{query.trim()}”
                  </span>
                  .
                </p>
                <p className="mt-2 text-sm text-[#5A6C85]">
                  Try “concrete”, “roof”, “paint” — or press{" "}
                  <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs">
                    ⌘K
                  </kbd>{" "}
                  for the smart search.
                </p>
              </div>
            )}
          </Reveal>
        ) : (
          <div className="space-y-12">
            {TOOL_CATEGORIES.map((c) => {
              const meta = getCategory(c);
              const tools = results.filter((t) => t.category === c && t.available);
              if (tools.length === 0) return null;
              return (
                <section key={c} aria-label={meta.label}>
                  <Reveal>
                    <div className="reveal flex items-baseline justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#0B1B33]">
                          {meta.label}
                        </h2>
                        <p className="mt-1 text-sm text-[#5A6C85]">{meta.tagline}</p>
                      </div>
                      <Link
                        href={`/categories/${c}`}
                        className="inline-flex min-h-[44px] shrink-0 items-center text-sm font-bold text-[#2563EB] hover:underline"
                      >
                        View hub →
                      </Link>
                    </div>
                  </Reveal>
                  <Reveal>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {tools.map((t, i) => (
                        <div
                          key={t.id}
                          className="reveal"
                          style={{ "--reveal-delay": `${(i % 6) * 60}ms` } as React.CSSProperties}
                        >
                          <ToolCard tool={t} />
                        </div>
                      ))}
                    </div>
                  </Reveal>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
