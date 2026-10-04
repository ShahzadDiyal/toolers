/**
 * BuildCalc Pro — Full calculator directory.
 * Renders from the central registry: search + category sections.
 * Tool cards link to /tools/[slug].
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, Lock, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TOOLS,
  TOOL_CATEGORIES,
  getCategory,
  toolHref,
  categoryHref,
  searchTools,
  TOTAL_TOOLS,
} from "@/data/toolsRegistry";
import { toolIcon } from "@/lib/tool-icons";

export default function ToolsPage() {
  const [query, setQuery] = React.useState("");
  const results = React.useMemo(() => searchTools(query), [query]);
  const filtering = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold uppercase tracking-wide sm:text-5xl">
          Calculator <span className="text-primary">directory</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          {TOTAL_TOOLS} trade calculators and counting. Live tools run
          instantly — the rest are on the build bench.
        </p>
        <div className="relative mt-6">
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

      <div className="mt-10 space-y-12">
        {TOOL_CATEGORIES.map((c) => {
          const meta = getCategory(c);
          const tools = (filtering ? results : TOOLS).filter((t) => t.category === c);
          if (tools.length === 0) return null;
          const live = tools.filter((t) => t.available).length;
          return (
            <section key={c} aria-label={meta.label} className="scroll-mt-32">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
                    <Link href={categoryHref(c)} className="transition-colors hover:text-primary">
                      {meta.label}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">{meta.tagline}</p>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono">
                  {live}/{tools.length} live
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => {
                  const Icon = toolIcon(t.iconName);
                  return (
                    <Link
                      key={t.id}
                      href={toolHref(t)}
                      aria-label={`${t.title} — Open calculator`}
                      className="min-h-[44px]"
                    >
                      <Card className="h-full transition-colors hover:border-primary/50">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                              <Icon className="h-5 w-5 text-primary" />
                            </span>
                            <div className="flex flex-col items-end gap-1.5">
                              {t.available ? (
                                <Badge variant="success">Live</Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Lock className="h-3 w-3" /> Soon
                                </Badge>
                              )}
                              {t.estimatedTime && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                                  <Clock className="h-3 w-3" />
                                  {t.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">{t.title}</CardTitle>
                          </div>
                          {t.badge && (
                            <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                              {t.badge}
                            </Badge>
                          )}
                          <CardDescription>{t.shortDescription}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                            Outputs
                          </p>
                          <p className="mt-1 text-sm text-zinc-300">
                            {t.outputs.join(" · ")}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <code className="rounded border border-border bg-zinc-950 px-2 py-1 font-mono text-[11px] text-zinc-400">
                              {t.formulaSummary}
                            </code>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                              Open calculator
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtering && results.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-zinc-400">
              No calculators match <span className="font-semibold text-zinc-200">“{query}”</span>.
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
