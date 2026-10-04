/**
 * BuildCalc Pro — Calculator directory.
 * Renders from the tool registry: search + category sections.
 * Category anchors (e.g. /tools#concrete) are deep-linkable from the navbar.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOOLS, TOOL_CATEGORIES, toolHref, searchTools } from "@/lib/tools-registry";
import { CATEGORY_META } from "@/types/estimator";
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
          Every estimator on the platform. Live tools run instantly — the rest
          are on the Phase 2 build list.
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
          const tools = (filtering ? results : TOOLS).filter((t) => t.category === c);
          if (tools.length === 0) return null;
          return (
            <section key={c} id={c} aria-label={CATEGORY_META[c].label} className="scroll-mt-32">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide">
                    {CATEGORY_META[c].label}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">{CATEGORY_META[c].tagline}</p>
                </div>
                <Badge variant="outline" className="font-mono shrink-0">
                  {tools.filter((t) => t.available).length}/{tools.length} live
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => {
                  const Icon = toolIcon(t.iconName);
                  const inner = (
                    <Card
                      className={
                        "h-full transition-colors " +
                        (t.available
                          ? "hover:border-primary/50 cursor-pointer"
                          : "opacity-60")
                      }
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
                            <Icon className="h-5 w-5 text-primary" />
                          </span>
                          {t.available ? (
                            <Badge variant="success">Live</Badge>
                          ) : (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3" /> Soon
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="mt-3 text-lg">{t.title}</CardTitle>
                        <CardDescription>{t.shortDescription}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <code className="rounded bg-zinc-950 px-2 py-1 font-mono text-[11px] text-zinc-400 border border-border">
                            {t.formulaSummary}
                          </code>
                          {t.available && (
                            <ArrowRight className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                  return t.available ? (
                    <Link key={t.id} href={toolHref(t)} aria-label={t.title}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={t.id} aria-label={`${t.title} (coming soon)`}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtering && results.length === 0 && (
          <p className="py-16 text-center text-zinc-500">
            No calculators match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
